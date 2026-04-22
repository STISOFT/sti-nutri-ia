import { NextRequest, NextResponse } from 'next/server';
import { verifyCulqiWebhookSignature } from '@/lib/culqi/client';
import { prisma } from '@/lib/prisma/client';
import { culqiWebhookSchema } from '@/lib/validations/payment';

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
  console.log(`[webhook] Evento recibido: ${event.type} — charge ${event.data.id}`);

  switch (event.type) {
    case 'charge.succeeded': {
      await prisma.subscription.updateMany({
        where: { culqi_charge_id: event.data.id, status: 'pending' },
        data: { status: 'active' },
      });
      break;
    }
    case 'charge.failed': {
      await prisma.subscription.updateMany({
        where: { culqi_charge_id: event.data.id },
        data: { status: 'inactive' },
      });
      break;
    }
    case 'charge.captured': {
      await prisma.subscription.updateMany({
        where: { culqi_charge_id: event.data.id },
        data: { status: 'active' },
      });
      break;
    }
    default:
      console.log(`[webhook] Evento ignorado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
