import { CreditCardIcon, ClockIcon } from 'lucide-react';

export default function SuscripcionPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 mb-4">
        <CreditCardIcon className="size-7 text-primary" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground">Mi suscripción</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Consulta el estado de tu plan, fecha de renovación y opciones de
        cancelación desde aquí.
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ClockIcon className="size-4" />
        Módulo 7 — próximamente
      </div>
    </div>
  );
}
