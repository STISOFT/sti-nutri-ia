import { NextRequest, NextResponse } from 'next/server';
import { verifyCulqiWebhookSignature } from '@/lib/culqi/client';
import { prisma } from '@/lib/prisma/client';
import { culqiWebhookSchema } from '@/lib/validations/payment';

// POST /api/payments/webhook
// Recibe eventos de Culqi para mantener la fila local en sync.
//
// Eventos manejados:
//   charge.succeeded / charge.captured / charge.failed   — cargo único legacy
//   subscription.activate                                — suscripción creada y primer cobro OK
//   subscription.charge.create                           — cobro mensual exitoso
//   subscription.charge.error                            — cobro mensual falló (status → past_due)
//   subscription.cancel / subscription.expire            — terminada
//
// Cualquier evento desconocido se loguea pero se responde 200 — Culqi
// no debe reintentar indefinidamente por un evento que no nos importa.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-culqi-signature');

  const isValid = await verifyCulqiWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn('[webhook] Firma inválida — posible solicitud no autorizada');
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = culqiWebhookSchema.safeParse(body);
  if (!parsed.success) {
    console.warn('[webhook] Evento con estructura inesperada:', parsed.error.flatten());
    return NextResponse.json({ received: true });
  }

  const event = parsed.data;
  console.log(`[webhook] ${event.type} — data.id ${event.data.id}`);

  try {
    await handleEvent(event);
  } catch (err) {
    console.error('[webhook] Error procesando evento:', err);
    // Devolvemos 200 igualmente para que Culqi no reintente si el evento
    // ya fue idempotentemente aplicado o si es un mismatch transitorio.
  }

  return NextResponse.json({ received: true });
}

type WebhookEvent = ReturnType<typeof culqiWebhookSchema.parse>;

async function handleEvent(event: WebhookEvent) {
  // ── Eventos de suscripción ───────────────────────────────────
  // En subscription.* el id que necesitamos resolver suele venir en
  // data.id (el sub_xxx) o data.subscription_id según el evento.
  const subId = event.data.subscription_id ?? event.data.id;

  switch (event.type) {
    case 'subscription.activate': {
      await prisma.subscription.updateMany({
        where: { culqi_subscription_id: subId },
        data: {
          status: 'active',
          current_period_start: event.data.current_period_start
            ? new Date(event.data.current_period_start)
            : undefined,
          current_period_end: event.data.current_period_end
            ? new Date(event.data.current_period_end)
            : undefined,
        },
      });
      return;
    }

    case 'subscription.charge.create': {
      // Cobro mensual exitoso → extender period_end al siguiente ciclo.
      await prisma.subscription.updateMany({
        where: { culqi_subscription_id: subId },
        data: {
          status: 'active',
          current_period_start: event.data.current_period_start
            ? new Date(event.data.current_period_start)
            : undefined,
          current_period_end: event.data.current_period_end
            ? new Date(event.data.current_period_end)
            : event.data.next_billing_date
            ? new Date(event.data.next_billing_date)
            : undefined,
        },
      });
      return;
    }

    case 'subscription.charge.error': {
      // Tarjeta rechazada / fondos insuficientes. Culqi reintentará
      // según política; marcamos past_due para visibilidad.
      await prisma.subscription.updateMany({
        where: { culqi_subscription_id: subId },
        data: { status: 'past_due' },
      });
      return;
    }

    case 'subscription.cancel':
    case 'subscription.expire': {
      await prisma.subscription.updateMany({
        where: { culqi_subscription_id: subId },
        data: {
          status: 'cancelled',
          cancelled_at: new Date(),
        },
      });
      return;
    }

    // ── Eventos de cargo único (legacy) ────────────────────────
    case 'charge.succeeded':
    case 'charge.captured': {
      await prisma.subscription.updateMany({
        where: { culqi_charge_id: event.data.id },
        data: { status: 'active' },
      });
      return;
    }

    case 'charge.failed': {
      await prisma.subscription.updateMany({
        where: { culqi_charge_id: event.data.id },
        data: { status: 'inactive' },
      });
      return;
    }

    default:
      console.log(`[webhook] Evento ignorado: ${event.type}`);
  }
}
