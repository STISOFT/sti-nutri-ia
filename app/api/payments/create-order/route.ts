import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createOrderSchema } from '@/lib/validations/payment';
import { PLANS } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar plan_id
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Plan inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { plan_id } = parsed.data;

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

    // Retornar los datos necesarios para configurar el checkout de Culqi
    return NextResponse.json({
      user_email: user.email,
      plan: {
        id: plan.id,
        name: plan.name,
        amount: plan.price_cents,
        currency: 'PEN',
        description: `Plan ${plan.name} — 1 mes`,
      },
    });
  } catch (error) {
    console.error('[create-order] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
