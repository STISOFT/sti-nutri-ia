import Link from 'next/link';
import { ArrowRightIcon, ZapIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CTABanner() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <div className="mb-4 flex justify-center">
          <ZapIcon className="size-10 text-primary-foreground/80" />
        </div>

        <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
          Tu plan personalizado en 60 segundos
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
          Únete a más de 1,200 peruanos que ya tienen su plan de alimentación
          personalizado con IA. Desde S/29 al mes.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/register"
            className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'h-11 gap-2 px-8 text-base')}
          >
            Crear mi plan ahora
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="#precios"
            className="h-11 px-8 text-base text-primary-foreground/90 transition-colors hover:text-primary-foreground"
          >
            Ver precios →
          </Link>
        </div>

        <p className="mt-6 text-sm text-primary-foreground/60">
          Sin compromisos · Cancela cuando quieras · Pago seguro con Culqi
        </p>
      </div>
    </section>
  );
}
