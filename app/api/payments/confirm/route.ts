import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createCulqiCharge } from '@/lib/culqi/client';
import { createServiceClient } from '@/lib/supabase/service';
import { confirmPaymentSchema } from '@/lib/validations/payment';
import { PLANS } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar el body
    const parsed = confirmPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de pago inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token, plan_id, email } = parsed.data;

    // Verificar sesión activa
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
            } catch {
              // Ignorar en Server Components
            }
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

    const plan = PLANS[plan_id];

    // Crear el cargo en Culqi
    const charge = await createCulqiCharge({
      amount: plan.price_cents,
      currency_code: 'PEN',
      email,
      source_id: token,
      description: `NutriIA — Plan ${plan.name}`,
    });

    // Verificar que el cargo fue exitoso
    if (charge.object_error || !charge.id) {
      console.error('[confirm] Cargo rechazado por Culqi:', charge);
      const userMessage =
        charge.user_message ?? 'Tu tarjeta fue rechazada. Verifica los datos e intenta de nuevo.';
      return NextResponse.json({ error: userMessage }, { status: 402 });
    }

    // Calcular periodo de suscripción (1 mes)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Insertar suscripción usando service role (omite RLS)
    const serviceClient = createServiceClient();

    // Desactivar suscripciones anteriores del usuario
    await serviceClient
      .from('subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Crear la nueva suscripción activa
    const { data: subscription, error: subError } = await serviceClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id,
        status: 'active',
        culqi_charge_id: charge.id,
        amount_cents: plan.price_cents,
        currency: 'PEN',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        culqi_order_id: null,
      })
      .select()
      .single();

    if (subError) {
      console.error('[confirm] Error al guardar suscripción:', subError);
      // El cargo ya se procesó — no devolver error al usuario, loguear para revisión manual
      return NextResponse.json({
        success: true,
        charge_id: charge.id,
        warning: 'Cargo procesado pero error al guardar suscripción',
      });
    }

    // Enviar email de confirmación (non-blocking)
    try {
      const { sendPaymentConfirmationEmail } = await import('@/lib/resend/mailer');
      await sendPaymentConfirmationEmail({
        to: email,
        fullName: user.user_metadata?.full_name ?? email,
        planName: plan.name,
        amountSoles: plan.price_soles,
        chargeId: charge.id,
      });
    } catch (emailError) {
      // El email no es crítico — loguear y continuar
      console.error('[confirm] Error al enviar email de confirmación:', emailError);
    }

    return NextResponse.json({
      success: true,
      subscription_id: subscription.id,
      charge_id: charge.id,
    });
  } catch (error) {
    console.error('[confirm] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
