import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: NextRequest) {
  try {
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

    const { subscription_id } = await request.json();

    if (!subscription_id) {
      return NextResponse.json({ error: 'ID de suscripción requerido' }, { status: 400 });
    }

    // Verificar que la suscripción pertenece al usuario
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscription_id, user_id: user.id, status: 'active' },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada o ya cancelada' },
        { status: 404 }
      );
    }

    await prisma.subscription.update({
      where: { id: subscription_id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[payments/cancel] Error:', error);
    return NextResponse.json({ error: 'Error al cancelar la suscripción' }, { status: 500 });
  }
}
