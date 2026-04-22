import { HistoryIcon, ClockIcon } from 'lucide-react';

export default function HistorialPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 mb-4">
        <HistoryIcon className="size-7 text-primary" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground">Historial de planes</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Consulta todos tus planes anteriores organizados por mes y año.
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ClockIcon className="size-4" />
        Módulo 7 — próximamente
      </div>
    </div>
  );
}
