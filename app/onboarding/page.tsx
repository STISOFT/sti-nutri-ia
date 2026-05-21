import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma/client';
import { AssessmentForm } from '@/components/onboarding/AssessmentForm';

export const metadata: Metadata = {
  title: 'Evaluación inicial — KODA',
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

  // ── Verificar si ya completó la evaluación ────────────────────
  const assessment = await prisma.clientAssessment.findUnique({
    where: { user_id: user.id },
    select: { id: true },
  });

  if (assessment) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-background">
      <AssessmentForm />
    </main>
  );
}
