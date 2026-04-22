import { NextRequest, NextResponse } from 'next/server';
import { verifyCulqiWebhookSignature } from '@/lib/culqi/client';
import { createServiceClient } from '@/lib/supabase/service';
import { culqiWebhookSchema } from '@/lib/validations/payment';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-culqi-signature');

  // Verificar firma HMAC del webhook
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

  // Validar estructura del evento
  const parsed = culqiWebhookSchema.safeParse(body);
  if (!parsed.success) {
    console.warn('[webhook] Evento con estructura inesperada:', parsed.error.flatten());
    // Responder 200 para que Culqi no reintente
    return NextResponse.json({ received: true });
  }

  const event = parsed.data;
  const supabase = createServiceClient();

  console.log(`[webhook] Evento recibido: ${event.type} — charge ${event.data.id}`);

  switch (event.type) {
    case 'charge.succeeded': {
      // Actualizar suscripción a activa si estaba en pending
      const chargeId = event.data.id;
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('culqi_charge_id', chargeId)
        .eq('status', 'pending');

      if (error) {
        console.error('[webhook] Error al activar suscripción:', error);
      }
      break;
    }

    case 'charge.failed': {
      // Marcar suscripción como inactiva
      const chargeId = event.data.id;
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'inactive' })
        .eq('culqi_charge_id', chargeId);

      if (error) {
        console.error('[webhook] Error al desactivar suscripción:', error);
      }
      break;
    }

    case 'charge.captured': {
      // Cargo capturado — asegurar que esté activo
      const chargeId = event.data.id;
      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('culqi_charge_id', chargeId);
      break;
    }

    default:
      // Evento no manejado — ignorar sin error
      console.log(`[webhook] Evento ignorado: ${event.type}`);
  }

  // Siempre responder 200 para que Culqi no reintente
  return NextResponse.json({ received: true });
}
