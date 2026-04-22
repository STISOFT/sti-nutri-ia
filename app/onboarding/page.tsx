import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma/client';
import { OnboardingWizard } from '@/components/dashboard/OnboardingWizard';

export const metadata: Metadata = {
  title: 'Configura tu perfil — NutriIA',
  robots: { index: false },
};

export default async function OnboardingPage() {
  // ── Verificar sesión ──────────────────────────────────────────
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
    redirect('/auth/login?redirectTo=/onboarding');
  }

  // ── Verificar suscripción activa ──────────────────────────────
  const subscription = await prisma.subscription.findFirst({
    where: { user_id: user.id, status: 'active' },
  });

  if (!subscription) {
    redirect('/planes');
  }

  // ── Verificar si ya completó el perfil ────────────────────────
  const healthProfile = await prisma.userHealthProfile.findUnique({
    where: { user_id: user.id },
  });

  if (healthProfile) {
    redirect('/dashboard');
  }

  return <OnboardingWizard />;
}
