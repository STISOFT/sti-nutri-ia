import Link from 'next/link';
import { CheckIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PLANS } from '@/types/database';
import { cn } from '@/lib/utils';

export function Pricing() {
  const plans = Object.values(PLANS);

  return (
    <section id="precios" className="bg-background py-20 md:py-28">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Encabezado */}
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Planes simples, sin sorpresas
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Cancela cuando quieras. Sin contratos. Sin cobros ocultos.
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
              {/* Badge "Más popular" para el plan destacado */}
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

                {/* Lista de features */}
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={`/auth/register?plan=${plan.id}`}
                  className={cn(
                    buttonVariants({ variant: plan.highlight ? 'default' : 'outline' }),
                    'mt-auto w-full'
                  )}
                >
                  Empezar con {plan.name}
                </Link>
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
    </section>
  );
}
