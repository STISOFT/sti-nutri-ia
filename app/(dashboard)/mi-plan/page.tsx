import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma/client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DietPlanView } from '@/components/dashboard/DietPlanView';
import type { DietPlanData } from '@/types/database';

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
  });

  if (!activePlan) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <SparklesIcon className="size-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Aún no tienes un plan activo
        </h1>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Completa tu perfil de salud y nuestra IA generará un plan de
          alimentación personalizado de 4 semanas para ti.
        </p>
        <Link href="/onboarding" className={cn(buttonVariants(), 'mt-6 gap-2')}>
          <SparklesIcon className="size-4" />
          Generar mi plan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mi plan de dieta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan activo · {activePlan.month_year}
        </p>
      </div>

      <DietPlanView
        planData={activePlan.plan_data as unknown as DietPlanData}
        planId={activePlan.id}
      />
    </div>
  );
}
