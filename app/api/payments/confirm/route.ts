import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createCulqiCharge } from '@/lib/culqi/client';
import { prisma } from '@/lib/prisma/client';
import { confirmPaymentSchema } from '@/lib/validations/payment';
import { PLANS } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = confirmPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de pago inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token, plan_id, email } = parsed.data;

    // Verificar sesión activa (solo auth — Supabase)
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const plan = PLANS[plan_id];
    const isMock = process.env.CULQI_MOCK === 'true';

    // ── Modo real: crear cargo en Culqi ───────────────────────
    // ── Modo mock: saltar validación (solo desarrollo/testing) ─
    let chargeId: string;

    if (isMock) {
      console.log('[confirm] Modo mock activado — omitiendo cargo Culqi');
      chargeId = `mock_${Date.now()}`;
    } else {
      const charge = await createCulqiCharge({
        amount: plan.price_cents,
        currency_code: 'PEN',
        email,
        source_id: token,
        description: `NutriIA — Plan ${plan.name}`,
      });

      if (charge.object_error || !charge.id) {
        console.error('[confirm] Cargo rechazado por Culqi:', charge);
        const userMessage =
          charge.user_message ?? 'Tu tarjeta fue rechazada. Verifica los datos e intenta de nuevo.';
        return NextResponse.json({ error: userMessage }, { status: 402 });
      }

      chargeId = charge.id;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Desactivar suscripciones anteriores (Prisma — nuestra BD)
    await prisma.subscription.updateMany({
      where: { user_id: user.id, status: 'active' },
      data: { status: 'inactive' },
    });

    // Crear nueva suscripción activa
    const subscription = await prisma.subscription.create({
      data: {
        user_id: user.id,
        plan_id,
        status: 'active',
        culqi_charge_id: chargeId,
        amount_cents: plan.price_cents,
        currency: 'PEN',
        current_period_start: now,
        current_period_end: periodEnd,
      },
    });

    // Enviar email de confirmación (non-blocking)
    try {
      const { sendPaymentConfirmationEmail } = await import('@/lib/resend/mailer');
      await sendPaymentConfirmationEmail({
        to: email,
        fullName: user.user_metadata?.full_name ?? email,
        planName: plan.name,
        amountSoles: plan.price_soles,
        chargeId,
      });
    } catch (emailError) {
      console.error('[confirm] Error al enviar email de confirmación:', emailError);
    }

    return NextResponse.json({
      success: true,
      subscription_id: subscription.id,
      charge_id: chargeId,
    });
  } catch (error) {
    console.error('[confirm] Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
