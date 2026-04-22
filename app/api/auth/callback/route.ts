import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type'); // 'recovery' para reset de contraseña

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component — ignorar error de cookies en middleware
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] Error al intercambiar código:', error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
    }

    // Redirigir a recuperación de contraseña si corresponde
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/auth/login`);
    }

    // Sincronizar perfil en nuestra BD (upsert al verificar email)
    await prisma.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name ?? null,
      },
      update: {
        email: user.email!,
        full_name: user.user_metadata?.full_name ?? undefined,
      },
    });

    // Enviar email de bienvenida solo a usuarios nuevos (< 30s desde registro)
    const createdAt = new Date(user.created_at).getTime();
    const isNewUser = Date.now() - createdAt < 30_000;
    if (isNewUser && user.email) {
      try {
        const { sendWelcomeEmail } = await import('@/lib/resend/mailer');
        await sendWelcomeEmail({
          to: user.email,
          fullName: user.user_metadata?.full_name ?? user.email,
        });
      } catch (err) {
        console.error('[auth/callback] Error al enviar welcome email:', err);
      }
    }

    // Verificar suscripción activa en nuestra BD
    const subscription = await prisma.subscription.findFirst({
      where: { user_id: user.id, status: 'active' },
    });

    // Verificar perfil de salud en nuestra BD
    const healthProfile = await prisma.userHealthProfile.findUnique({
      where: { user_id: user.id },
    });

    if (!subscription) {
      return NextResponse.redirect(`${origin}/planes`);
    }

    if (!healthProfile) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
}
