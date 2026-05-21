'use client';

import { useState } from 'react';
import { DownloadIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { KodaPlan } from '@/types/method';

interface KodaPlanPdfButtonProps {
  plan: KodaPlan;
  planId: string;
  userName?: string;
}

/**
 * Descarga el PDF del KodaPlan. La librería react-pdf solo se carga
 * dinámicamente al hacer click para no inflar el bundle inicial.
 */
export function KodaPlanPdfButton({ plan, planId, userName }: KodaPlanPdfButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { KodaPlanPdfDocument } = await import('./KodaPlanPdfDocument');

      // react-pdf espera un Document JSX directo; los tipos no se
      // alinean con un ReactElement plano, pero es la forma oficial.
      const blob = await pdf(
        <KodaPlanPdfDocument plan={plan} userName={userName} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `koda-plan-${planId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[KodaPlanPdfButton] Error generando PDF:', err);
      toast.error('No pudimos generar el PDF. Inténtalo de nuevo.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleDownload}
      disabled={generating}
    >
      {generating ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <DownloadIcon className="size-4" />
      )}
      {generating ? 'Generando...' : 'Descargar PDF'}
    </Button>
  );
}
