import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { ZapIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { PLANS } from '@/types/database';
import type { PlanId } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CancelSubscriptionButton } from '@/components/dashboard/CancelSubscriptionButton';

export default async function SuscripcionPage() {
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

  const subscription = await prisma.subscription.findFirst({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  });

  const planInfo = subscription ? PLANS[subscription.plan_id as PlanId] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mi suscripción</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tu plan y opciones de renovación.
        </p>
      </div>

      {!subscription || subscription.status !== 'active' ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <AlertCircleIcon className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No tienes una suscripción activa</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Elige un plan para acceder a tu plan de dieta personalizado.
              </p>
            </div>
            <Link href="/planes" className={cn(buttonVariants())}>Ver planes</Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Estado actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ZapIcon className="size-4 text-primary" />
                Plan actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground">{planInfo?.name}</span>
                <Badge className="bg-primary/10 text-primary border-0">Activa</Badge>
              </div>
              <div className="text-3xl font-bold text-foreground">
                S/ {planInfo?.price_soles}
                <span className="text-base font-normal text-muted-foreground">/mes</span>
              </div>

              <Separator />

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Inicio del período</p>
                  <p className="font-medium text-foreground">
                    {subscription.current_period_start
                      ? format(new Date(subscription.current_period_start), "d 'de' MMMM, yyyy", { locale: es })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Próxima renovación</p>
                  <p className="font-medium text-foreground">
                    {subscription.current_period_end
                      ? format(new Date(subscription.current_period_end), "d 'de' MMMM, yyyy", { locale: es })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Generaciones incluidas</p>
                  <p className="font-medium text-foreground">
                    {planInfo?.generations_per_month === -1
                      ? 'Ilimitadas'
                      : `${planInfo?.generations_per_month} por mes`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monto pagado</p>
                  <p className="font-medium text-foreground">
                    S/ {((subscription.amount_cents ?? 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Beneficios */}
              <Separator />
              <ul className="space-y-2">
                {planInfo?.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckIcon className="size-4 shrink-0 text-primary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Cancelar */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Zona de peligro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Al cancelar tu suscripción perderás acceso a la generación de nuevos planes al
                final del período actual. Tus planes anteriores seguirán disponibles.
              </p>
              <CancelSubscriptionButton subscriptionId={subscription.id} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
