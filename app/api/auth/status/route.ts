import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';

/**
 * GET /api/auth/status
 * Retorna el estado del usuario para determinar a dónde redirigir tras el login.
 */
export async function GET(request: NextRequest) {
  void request;

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

  const [subscription, healthProfile] = await Promise.all([
    prisma.subscription.findFirst({
      where: { user_id: user.id, status: 'active' },
      select: { id: true },
    }),
    prisma.userHealthProfile.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    }),
  ]);

  return NextResponse.json({
    hasSubscription: !!subscription,
    hasHealthProfile: !!healthProfile,
  });
}
