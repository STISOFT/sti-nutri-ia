'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <AlertTriangleIcon className="size-8 text-destructive" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground">
        Algo salió mal
      </h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RefreshCwIcon className="size-4" />
          Reintentar
        </Button>
        <Link href="/" className={cn(buttonVariants())}>Ir al inicio</Link>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground">
          Código de error: {error.digest}
        </p>
      )}
    </div>
  );
}
