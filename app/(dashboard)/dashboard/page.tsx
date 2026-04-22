import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  LeafIcon,
  ArrowRightIcon,
  ZapIcon,
  UserIcon,
  SparklesIcon,
} from 'lucide-react';
import { prisma } from '@/lib/prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { MacroProgressBar } from '@/components/dashboard/MacroProgressBar';
import { cn } from '@/lib/utils';
import { PLANS } from '@/types/database';
import type { PlanId } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default async function DashboardPage() {
  // ── Sesión ────────────────────────────────────────────────
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

  // ── Datos del usuario ─────────────────────────────────────
  const [subscription, activePlan] = await Promise.all([
    prisma.subscription.findFirst({
      where: { user_id: user.id, status: 'active' },
    }),
    prisma.dietPlan.findFirst({
      where: { user_id: user.id, is_active: true },
    }),
  ]);

  const fullName = user.user_metadata?.full_name ?? user.email ?? 'Usuario';
  const firstName = fullName.split(' ')[0];
  const planInfo = subscription ? PLANS[subscription.plan_id as PlanId] : null;

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Grid principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Suscripción */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ZapIcon className="size-4" />
              Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planInfo ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">{planInfo.name}</span>
                  <Badge className="bg-primary/10 text-primary border-0">Activa</Badge>
                </div>
                {subscription?.current_period_end && (
                  <p className="text-sm text-muted-foreground">
                    Renueva el{' '}
                    {format(new Date(subscription.current_period_end), "d 'de' MMMM", {
                      locale: es,
                    })}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sin suscripción activa</p>
                <Link href="/planes" className={cn(buttonVariants({ size: 'sm' }), 'w-full')}>
                  Ver planes
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan activo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <LeafIcon className="size-4" />
              Plan activo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activePlan ? (
              <div className="space-y-1">
                <p className="text-xl font-bold text-foreground">
                  {activePlan.calories_target?.toLocaleString() ?? '—'} kcal/día
                </p>
                <p className="text-sm text-muted-foreground">
                  Generado en {activePlan.month_year}
                </p>
                <Link href="/mi-plan" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'mt-2 w-full gap-1')}>
                  Ver plan completo <ArrowRightIcon className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Aún no tienes un plan generado</p>
                {subscription && (
                  <Link href="/onboarding" className={cn(buttonVariants({ size: 'sm' }), 'w-full gap-1')}>
                    <SparklesIcon className="size-3" /> Generar plan
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDaysIcon className="size-4" />
              Acciones rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/mi-plan" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'w-full justify-start gap-2')}>
              <CalendarDaysIcon className="size-4" /> Ver mi plan
            </Link>
            <Link href="/perfil" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'w-full justify-start gap-2')}>
              <UserIcon className="size-4" /> Editar perfil
            </Link>
            <Link href="/historial" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'w-full justify-start gap-2')}>
              <SparklesIcon className="size-4" /> Historial de planes
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Macros del plan activo */}
      {activePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Objetivos nutricionales diarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MacroProgressBar
              label="Calorías"
              value={activePlan.calories_target ?? 0}
              max={activePlan.calories_target ?? 0}
              unit=" kcal"
              color="calories"
            />
            <MacroProgressBar
              label="Proteínas"
              value={activePlan.protein_target_g ?? 0}
              max={activePlan.protein_target_g ?? 0}
              color="protein"
            />
            <MacroProgressBar
              label="Carbohidratos"
              value={activePlan.carbs_target_g ?? 0}
              max={activePlan.carbs_target_g ?? 0}
              color="carbs"
            />
            <MacroProgressBar
              label="Grasas"
              value={activePlan.fat_target_g ?? 0}
              max={activePlan.fat_target_g ?? 0}
              color="fat"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
