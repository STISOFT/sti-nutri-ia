import type { Metadata } from 'next';
import Link from 'next/link';
import { LeafIcon, ClipboardListIcon, ArrowRightIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Configura tu perfil — NutriIA',
  robots: { index: false },
};

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-2 font-bold text-foreground">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary">
          <LeafIcon className="size-4 text-primary-foreground" />
        </div>
        <span className="text-xl">NutriIA</span>
      </Link>

      <div className="w-full max-w-md rounded-xl border border-border bg-card p-10 shadow-sm text-center">
        {/* Icono */}
        <div className="mb-5 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ClipboardListIcon className="size-8 text-primary" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground">
          Configura tu perfil de salud
        </h1>

        <p className="mt-3 text-muted-foreground">
          Esta sección estará disponible muy pronto. Aquí completarás tu perfil
          (peso, talla, objetivo) para que nuestra IA genere tu plan de
          alimentación personalizado.
        </p>

        {/* Pasos que vendrán */}
        <ol className="mt-6 flex flex-col gap-2 text-left text-sm">
          {[
            'Tus datos físicos (edad, peso, talla)',
            'Tu objetivo y nivel de actividad',
            'Tus preferencias y alergias alimentarias',
          ].map((paso, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{paso}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full gap-2')}
          >
            Ir al dashboard
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
