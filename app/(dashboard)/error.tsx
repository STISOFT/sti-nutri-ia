'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DashboardError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 mb-5">
        <AlertTriangleIcon className="size-7 text-destructive" />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground">
        Error al cargar la página
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        No pudimos cargar esta sección. Intenta de nuevo o regresa al dashboard.
      </p>
      <div className="mt-5 flex gap-3">
        <Button variant="outline" size="sm" onClick={reset} className="gap-2">
          <RefreshCwIcon className="size-4" />
          Reintentar
        </Button>
        <Link href="/dashboard" className={cn(buttonVariants({ size: 'sm' }))}>
          Ir al dashboard
        </Link>
      </div>
    </div>
  );
}
