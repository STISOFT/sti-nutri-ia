import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28 lg:py-36">
      {/* Gradiente decorativo de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]"
      />

      <div className="container mx-auto max-w-5xl px-4 text-center">
        {/* Badge de novedad */}
        <div className="mb-6 flex justify-center">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
            <SparklesIcon className="size-3.5 text-primary" />
            Sistema personalizado con IA
          </Badge>
        </div>

        {/* Titular principal */}
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Tu cuerpo no necesita{' '}
          <span className="text-primary">otra dieta</span>
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Necesita un sistema que entienda cómo funciona. KODA crea tu plan de
          alimentación y entrenamiento adaptado a tu cuerpo, tu rutina y lo que
          realmente puedes sostener.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/register"
            className={cn(buttonVariants({ size: 'lg' }), 'h-11 gap-2 px-8 text-base')}
          >
            Crear mi plan ahora
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="#como-funciona"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-8 text-base')}
          >
            Ver cómo funciona
          </Link>
        </div>

        {/* Prueba social rápida */}
        <p className="mt-8 text-sm text-muted-foreground">
          Más de{' '}
          <span className="font-semibold text-foreground">1,200 personas</span>{' '}
          ya dejaron de adivinar qué hacer con su cuerpo
        </p>
      </div>
    </section>
  );
}
