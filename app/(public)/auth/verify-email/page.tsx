import type { Metadata } from 'next';
import Link from 'next/link';
import { LeafIcon, MailCheckIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Verifica tu correo — KODA',
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-foreground">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary">
          <LeafIcon className="size-4 text-primary-foreground" />
        </div>
        <span className="text-xl">KODA</span>
      </Link>

      {/* Tarjeta de verificación */}
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm text-center">
        {/* Icono */}
        <div className="mb-5 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheckIcon className="size-8 text-primary" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground">
          Revisa tu correo
        </h1>

        <p className="mt-3 text-muted-foreground">
          Enviamos un enlace de verificación a{' '}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            'tu correo electrónico'
          )}
          .
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Haz clic en el enlace del correo para activar tu cuenta. Si no lo ves,
          revisa la carpeta de spam o correo no deseado.
        </p>

        {/* Pasos */}
        <ol className="mt-6 flex flex-col gap-2 text-left text-sm">
          {[
            'Abre tu bandeja de entrada',
            'Busca el correo de KODA',
            'Haz clic en "Verificar mi cuenta"',
          ].map((paso, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{paso}</span>
            </li>
          ))}
        </ol>

        {/* Link de vuelta al login */}
        <div className="mt-8">
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
