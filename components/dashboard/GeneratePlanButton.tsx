'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2Icon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface GeneratePlanButtonProps {
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

/**
 * Botón que dispara POST /api/plan/generate y, al terminar, recarga
 * la página para que el server component muestre el plan recién creado.
 * Maneja loading + errores con toast.
 */
export function GeneratePlanButton({
  label = 'Generar mi plan',
  className,
  variant = 'default',
}: GeneratePlanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/plan/generate', { method: 'POST' });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(body.error ?? 'No pudimos generar tu plan.');
        setLoading(false);
        return;
      }

      toast.success('¡Tu plan está listo!');
      router.push('/mi-plan');
      router.refresh();
    } catch {
      toast.error('Error de red. Inténtalo de nuevo.');
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant={variant} className={className}>
      {loading ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          Generando... (esto puede tomar hasta 30s)
        </>
      ) : (
        <>
          <SparklesIcon className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
