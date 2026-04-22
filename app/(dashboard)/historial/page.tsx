import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { CalendarIcon, LeafIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DietPlanData } from '@/types/database';

export default async function HistorialPage() {
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

  const planes = await prisma.dietPlan.findMany({
    where: { user_id: user.id },
    orderBy: { generated_at: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Historial de planes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {planes.length} {planes.length === 1 ? 'plan generado' : 'planes generados'} en total
        </p>
      </div>

      {planes.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
            <CalendarIcon className="size-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Todavía no tienes planes anteriores</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuando generes tu primer plan aparecerá aquí.
          </p>
          <Link href="/onboarding" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
            Generar mi primer plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planes.map((plan) => {
            const data = plan.plan_data as unknown as DietPlanData;
            const [year, month] = plan.month_year.split('-');
            const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString(
              'es-PE',
              { month: 'long', year: 'numeric' }
            );

            return (
              <Card key={plan.id} className={plan.is_active ? 'border-primary/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm capitalize">
                      <LeafIcon className="size-4 text-primary" />
                      {monthName}
                    </CardTitle>
                    {plan.is_active && (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">
                        Activo
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Calorías</p>
                      <p className="font-semibold text-foreground">
                        {data.summary.calories_per_day} kcal
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Proteínas</p>
                      <p className="font-semibold text-foreground">{data.summary.protein_g}g</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Carbohidratos</p>
                      <p className="font-semibold text-foreground">{data.summary.carbs_g}g</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Grasas</p>
                      <p className="font-semibold text-foreground">{data.summary.fat_g}g</p>
                    </div>
                  </div>
                  {plan.is_active && (
                    <Link href="/mi-plan" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'w-full')}>
                      Ver plan activo
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
