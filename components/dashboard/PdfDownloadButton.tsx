'use client';

import { useState } from 'react';
import { DownloadIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DietPlanData } from '@/types/database';

// PdfDocument se importa dinámicamente solo al hacer click (ver handleDownload)

interface PdfDownloadButtonProps {
  planData: DietPlanData;
  planId: string;
}

export function PdfDownloadButton({ planData, planId }: PdfDownloadButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      // Importación dinámica para que react-pdf solo cargue al hacer click
      const { pdf } = await import('@react-pdf/renderer');
      const { PdfDocument: Doc } = await import('./PdfDocument');
      const { createElement } = await import('react');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(createElement(Doc, { planData }) as any).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutriia-plan-${planId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[PdfDownloadButton] Error generando PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

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
