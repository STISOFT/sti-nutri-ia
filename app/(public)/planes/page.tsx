import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { CheckIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { buttonVariants } from '@/components/ui/button';
import { PLANS } from '@/types/database';
import { cn } from '@/lib/utils';
import { PlanesCheckoutClient } from '@/components/shared/PlanesCheckoutClient';

export const metadata: Metadata = {
  title: 'Planes y Precios — KODA',
  description: 'Elige el plan de dieta personalizada con IA que mejor se adapta a tus objetivos.',
};

export default async function PlanesPage() {
  // Verificar si el usuario está autenticado
  const cookieStore = await cookies();
  let userEmail: string | null = null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {}, // Read-only en Server Component
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    userEmail = user?.email ?? null;
  }

  const plans = Object.values(PLANS);

  return (
    <div className="bg-background py-20 md:py-28">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Encabezado */}
        <div className="mb-16 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Elige tu plan
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Cancela cuando quieras. Sin contratos. Sin cobros ocultos.
            Pago seguro con Visa y Mastercard peruanas.
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={
                plan.highlight
                  ? 'relative border-2 border-primary shadow-lg'
                  : 'relative'
              }
            >
              {/* Badge para el plan destacado */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-0.5 text-xs">Más popular</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.id === 'basico' && 'Ideal para empezar'}
                  {plan.id === 'estandar' && 'El preferido de nuestros usuarios'}
                  {plan.id === 'premium' && 'Para quienes quieren todo'}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-5">
                {/* Precio */}
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    S/{plan.price_soles}
                  </span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>

                <Separator />

                {/* Features */}
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — Checkout si logueado, registro si no */}
                {userEmail ? (
                  <PlanesCheckoutClient
                    planId={plan.id}
                    userEmail={userEmail}
                    highlight={plan.highlight}
                    planName={plan.name}
                  />
                ) : (
                  <Link
                    href={`/auth/register?plan=${plan.id}`}
                    className={cn(
                      buttonVariants({
                        variant: plan.highlight ? 'default' : 'outline',
                      }),
                      'mt-auto w-full'
                    )}
                  >
                    Empezar con {plan.name}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nota de garantía */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Pagos seguros con Visa y Mastercard peruanas.{' '}
          <span className="font-medium text-foreground">
            Cancela en cualquier momento desde tu cuenta.
          </span>
        </p>
      </div>
    </div>
  );
}
