import type { Metadata } from 'next';
import Link from 'next/link';
import { LeafIcon } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Crear cuenta — KODA',
  description: 'Regístrate gratis y obtén tu plan de alimentación personalizado con IA.',
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-foreground">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary">
          <LeafIcon className="size-4 text-primary-foreground" />
        </div>
        <span className="text-xl">KODA</span>
      </Link>

      {/* Tarjeta del formulario */}
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Crea tu cuenta gratis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu plan de dieta personalizado en minutos
          </p>
        </div>

        <RegisterForm />
      </div>

      {/* Texto legal */}
      <p className="mt-6 max-w-sm text-center text-xs text-muted-foreground">
        Al registrarte aceptas nuestros{' '}
        <Link href="/terminos" className="underline hover:text-foreground">
          Términos de servicio
        </Link>{' '}
        y{' '}
        <Link href="/privacidad" className="underline hover:text-foreground">
          Política de privacidad
        </Link>
        .
      </p>
    </div>
  );
}
