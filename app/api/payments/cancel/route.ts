import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { cancelCulqiSubscription } from '@/lib/culqi/client';

// POST /api/payments/cancel
// Cancela una suscripción activa. Si tiene culqi_subscription_id, también
// llama a Culqi para detener los cobros futuros. La fila local se marca
// como 'cancelled' aunque Culqi falle (best-effort) — el usuario no debería
// quedarse atrapado en su propia DB.
export async function POST(request: NextRequest) {
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

  let payload: { subscription_id?: string };
  try {
    payload = (await request.json()) as { subscription_id?: string };
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
  if (!payload.subscription_id) {
    return NextResponse.json({ error: 'ID de suscripción requerido' }, { status: 400 });
  }

  // Sólo el dueño puede cancelar.
  const subscription = await prisma.subscription.findFirst({
    where: { id: payload.subscription_id, user_id: user.id, status: 'active' },
  });
  if (!subscription) {
    return NextResponse.json(
      { error: 'Suscripción no encontrada o ya cancelada' },
      { status: 404 }
    );
  }

  // Cancelar en Culqi si es subscripción recurrente.
  if (subscription.culqi_subscription_id) {
    const result = await cancelCulqiSubscription(subscription.culqi_subscription_id);
    if (result.object_error) {
      console.error('[payments/cancel] Culqi error:', result);
      // No bloqueamos — marcamos local como cancelled igual; el webhook
      // de Culqi acabará reconciliando si hubo problema.
    }
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'cancelled',
      cancelled_at: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
