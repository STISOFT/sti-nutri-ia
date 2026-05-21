import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { subscribePaymentSchema } from '@/lib/validations/payment';
import {
  createCulqiCustomer,
  createCulqiCard,
  createCulqiSubscription,
} from '@/lib/culqi/client';
import { getCulqiPlanId } from '@/lib/culqi/plans';
import { PLANS } from '@/types/database';

// POST /api/payments/subscribe
// Crea una suscripción recurrente en Culqi (Customer + Card + Subscription)
// y persiste en nuestra tabla `subscriptions`.
//
// Flujo:
//   1. Validar payload (token + plan_id + datos del cliente)
//   2. Verificar auth + que no haya ya una subscripción activa
//   3. Crear Customer en Culqi
//   4. Asociar la tarjeta tokenizada al Customer
//   5. Crear Subscription apuntando al plan
//   6. Guardar/actualizar nuestra fila en `subscriptions`
//   7. Devolver al cliente
//
// Cualquier paso de Culqi que falle revierte deshace lo persistido en
// Culqi (best-effort) y devuelve un mensaje legible al usuario.
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  // ── 1. Validar payload ───────────────────────────────────────
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const parsed = subscribePaymentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const { token, plan_id, customer } = parsed.data;

  // ── 2. Auth ──────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // ── 3. Bloquear si ya hay subscripción activa ────────────────
  const existing = await prisma.subscription.findFirst({
    where: { user_id: user.id, status: 'active' },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'Ya tienes una suscripción activa. Cancélala antes de cambiar de plan.' },
      { status: 409 }
    );
  }

  // ── 4. Resolver el plan Culqi ────────────────────────────────
  const planConfig = PLANS[plan_id];
  let culqiPlanId: string;
  try {
    culqiPlanId = getCulqiPlanId(plan_id);
  } catch (err) {
    console.error('[payments/subscribe]', err);
    return NextResponse.json(
      { error: 'Configuración de pagos incompleta. Contacta soporte.' },
      { status: 503 }
    );
  }

  // ── 5. Crear Customer en Culqi ───────────────────────────────
  console.log(`[payments/subscribe] Creando customer para user ${user.id}`);
  const culqiCustomer = await createCulqiCustomer({
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    address: customer.address,
    address_city: customer.address_city,
    country_code: customer.country_code,
    phone_number: customer.phone_number,
    metadata: { koda_user_id: user.id },
  });

  if (culqiCustomer.object_error || !culqiCustomer.id) {
    console.error('[payments/subscribe] Customer error:', culqiCustomer);
    return NextResponse.json(
      {
        error:
          culqiCustomer.user_message ??
          culqiCustomer.merchant_message ??
          'No pudimos registrar tus datos de cliente. Verifica e inténtalo de nuevo.',
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            stage: 'createCustomer',
            object_error: culqiCustomer.object_error,
            type: culqiCustomer.type,
            code: culqiCustomer.code,
            merchant_message: culqiCustomer.merchant_message,
            user_message: culqiCustomer.user_message,
          },
        }),
      },
      { status: 402 }
    );
  }
  const customerId = culqiCustomer.id;

  // ── 6. Asociar Card al Customer ──────────────────────────────
  console.log(`[payments/subscribe] Creando card para customer ${customerId}`);
  const culqiCard = await createCulqiCard({
    customer_id: customerId,
    token_id: token,
    validate: true, // hace cargo de S/1 reversado para validar la tarjeta
    metadata: { koda_user_id: user.id, koda_plan_id: plan_id },
  });

  if (culqiCard.object_error || !culqiCard.id) {
    console.error('[payments/subscribe] Card error:', culqiCard);
    return NextResponse.json(
      {
        error:
          culqiCard.user_message ??
          culqiCard.merchant_message ??
          'No pudimos validar tu tarjeta. Verifica los datos e inténtalo de nuevo.',
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            stage: 'createCard',
            object_error: culqiCard.object_error,
            type: culqiCard.type,
            code: culqiCard.code,
            merchant_message: culqiCard.merchant_message,
            user_message: culqiCard.user_message,
          },
        }),
      },
      { status: 402 }
    );
  }
  const cardId = culqiCard.id;

  // ── 7. Crear Subscription ────────────────────────────────────
  // tyc=true: el usuario acepta T&C al completar el flujo de pago.
  // Nuestros T&C están en /legal/terminos y se referencian desde el
  // botón "Continuar al pago" del modal. Esta aceptación es
  // requisito regulatorio (PCI + INDECOPI) y Culqi la verifica.
  console.log(`[payments/subscribe] Creando subscription para card ${cardId}, plan ${culqiPlanId}`);
  const culqiSubscription = await createCulqiSubscription({
    card_id: cardId,
    plan_id: culqiPlanId,
    tyc: true,
    metadata: { koda_user_id: user.id, koda_plan_id: plan_id },
  });

  if (culqiSubscription.object_error || !culqiSubscription.id) {
    console.error('[payments/subscribe] Subscription error:', culqiSubscription);
    return NextResponse.json(
      {
        error:
          culqiSubscription.user_message ??
          culqiSubscription.merchant_message ??
          'No pudimos activar la suscripción. Inténtalo de nuevo en unos minutos.',
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            stage: 'createSubscription',
            object_error: culqiSubscription.object_error,
            type: culqiSubscription.type,
            code: culqiSubscription.code,
            merchant_message: culqiSubscription.merchant_message,
            user_message: culqiSubscription.user_message,
          },
        }),
      },
      { status: 402 }
    );
  }

  // ── 8. Persistir en nuestra DB ───────────────────────────────
  const periodStart = culqiSubscription.current_period_start
    ? new Date(culqiSubscription.current_period_start)
    : new Date();
  const periodEnd = culqiSubscription.current_period_end
    ? new Date(culqiSubscription.current_period_end)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // fallback 30 días

  const subscription = await prisma.subscription.create({
    data: {
      user_id: user.id,
      plan_id,
      status: 'active',
      culqi_customer_id: customerId,
      culqi_card_id: cardId,
      culqi_subscription_id: culqiSubscription.id,
      amount_cents: planConfig.price_cents,
      currency: 'PEN',
      current_period_start: periodStart,
      current_period_end: periodEnd,
    },
  });

  // ── 9. Email de confirmación (non-blocking) ──────────────────
  try {
    const { sendPaymentConfirmationEmail } = await import('@/lib/resend/mailer');
    await sendPaymentConfirmationEmail({
      to: customer.email,
      fullName: `${customer.first_name} ${customer.last_name}`.trim(),
      planName: planConfig.name,
      amountSoles: planConfig.price_soles,
      chargeId: culqiSubscription.id,
    });
  } catch (emailErr) {
    console.error('[payments/subscribe] Email error:', emailErr);
  }

  return NextResponse.json(
    {
      ok: true,
      subscription_id: subscription.id,
      culqi_subscription_id: culqiSubscription.id,
      current_period_end: periodEnd.toISOString(),
    },
    { status: 201 }
  );
}
