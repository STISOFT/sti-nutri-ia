import type { Metadata } from 'next';
import Link from 'next/link';
import { LeafIcon } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar sesión — KODA',
  description: 'Accede a tu cuenta y consulta tu plan de alimentación personalizado.',
  robots: { index: false },
};

export default function LoginPage() {
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
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para ver tu plan de dieta
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
