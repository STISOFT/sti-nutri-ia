import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

// Cron job diario a las 9am — notifica a usuarios con renovación en 5 días
// Configurado en vercel.json: "0 9 * * *"
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verificar que la llamada viene de Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Suscripciones que renuevan en exactamente 5 días
    const now = new Date();
    const fiveDaysFromNow = new Date(now);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    const startOfDay = new Date(fiveDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(fiveDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        current_period_end: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: 'Sin renovaciones próximas' });
    }

    // Importar mailer de forma lazy
    const { sendRenewalReminderEmail } = await import('@/lib/resend/mailer');
    const { PLANS } = await import('@/types/database');
    const { createServerClient } = await import('@supabase/ssr');

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        // Obtener email del usuario desde Supabase Auth (service role)
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { cookies: { getAll: () => [], setAll: () => {} } }
        );

        const { data: { user } } = await supabase.auth.admin.getUserById(sub.user_id);

        if (!user?.email) continue;

        const planInfo = PLANS[sub.plan_id as keyof typeof PLANS];
        const renewalDate = sub.current_period_end
          ? new Date(sub.current_period_end).toLocaleDateString('es-PE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'próximamente';

        await sendRenewalReminderEmail({
          to: user.email,
          fullName: user.user_metadata?.full_name ?? user.email,
          planName: planInfo?.name ?? sub.plan_id,
          renewalDate,
          amountSoles: planInfo?.price_soles ?? 0,
        });

        sent++;
      } catch (err) {
        errors.push(`${sub.user_id}: ${err}`);
        console.error(`[cron/renewal-reminder] Error para ${sub.user_id}:`, err);
      }
    }

    console.log(`[cron/renewal-reminder] Enviados: ${sent}/${subscriptions.length}`);

    return NextResponse.json({
      sent,
      total: subscriptions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[cron/renewal-reminder] Error general:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
