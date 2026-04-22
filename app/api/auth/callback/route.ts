import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    // Verificar el estado del usuario para determinar a dónde redirigir
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/auth/login`);
    }

    // Verificar suscripción activa
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    // Verificar perfil de salud
    const { data: healthProfile } = await supabase
      .from('user_health_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!subscription) {
      // Sin suscripción → página de planes
      return NextResponse.redirect(`${origin}/planes`);
    }

    if (!healthProfile) {
      // Con suscripción pero sin onboarding → onboarding
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    // Usuario completo → dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Sin código → redirigir a login con error
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
}
