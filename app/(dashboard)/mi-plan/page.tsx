import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { ClipboardEditIcon, SparklesIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma/client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DietPlanView } from '@/components/dashboard/DietPlanView';
import { KodaPlanView } from '@/components/dashboard/KodaPlanView';
import { GeneratePlanButton } from '@/components/dashboard/GeneratePlanButton';
import type { DietPlanData } from '@/types/database';
import type { KodaPlan } from '@/types/method';

export default async function MiPlanPage() {
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
  if (!user) redirect('/auth/login');

  const activePlan = await prisma.dietPlan.findFirst({
    where: { user_id: user.id, is_active: true },
    orderBy: { generated_at: 'desc' },
  });

  // Si no hay plan activo, decidimos el siguiente paso según el estado
  // de la evaluación: sin assessment → /onboarding; con assessment →
  // botón para generar el plan en sitio.
  if (!activePlan) {
    const assessment = await prisma.clientAssessment.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    });

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <SparklesIcon className="size-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {assessment ? 'Listo para generar tu plan' : 'Aún no tienes un plan activo'}
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          {assessment
            ? 'Tu evaluación está completa. Genera tu plan personalizado en menos de un minuto.'
            : 'Completa tu evaluación inicial y nuestra IA generará un plan adaptado a tu cuerpo, rutina y objetivos.'}
        </p>
        <div className="mt-6">
          {assessment ? (
            <GeneratePlanButton />
          ) : (
            <Link href="/onboarding" className={cn(buttonVariants(), 'gap-2')}>
              <ClipboardEditIcon className="size-4" />
              Empezar evaluación
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Detectar formato del plan persistido. El nuevo KodaPlan tiene
  // 'nutrition' + 'training' + 'recovery'; el viejo DietPlanData
  // tenía 'summary' + 'weeks'.
  const planData = activePlan.plan_data as unknown;
  const isKodaPlan =
    typeof planData === 'object' &&
    planData !== null &&
    'nutrition' in planData &&
    'training' in planData &&
    'recovery' in planData;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Mi plan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan activo · generado {formatDate(activePlan.generated_at)}
          </p>
        </div>
        <GeneratePlanButton label="Regenerar plan" variant="outline" />
      </div>

      {isKodaPlan ? (
        <KodaPlanView
          plan={planData as KodaPlan}
          planId={activePlan.id}
          userName={user.user_metadata?.full_name as string | undefined}
        />
      ) : (
        <DietPlanView
          planData={planData as DietPlanData}
          planId={activePlan.id}
        />
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
