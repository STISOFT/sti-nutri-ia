import type { Metadata } from 'next';
import { BookOpenIcon } from 'lucide-react';
import { ComplaintForm } from '@/components/legal/ComplaintForm';

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones — KODA',
  description:
    'Registra tu queja o reclamo. KODA cuenta con un Libro de Reclamaciones virtual conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571).',
  robots: { index: true, follow: true },
};

export default function LibroDeReclamacionesPage() {
  return (
    <div className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Encabezado */}
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <BookOpenIcon className="size-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Libro de Reclamaciones
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Conforme al Código de Protección y Defensa del Consumidor
            (Ley N° 29571), KODA pone a tu disposición este Libro de
            Reclamaciones virtual. Completa el formulario y te enviaremos
            una copia por correo.
          </p>
        </header>

        {/* Instrucciones */}
        <ul className="mb-8 space-y-2 rounded-lg border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          <li>• Por favor llena todos los campos solicitados.</li>
          <li>
            • Recibirás una copia del registro en el correo que ingreses.
          </li>
          <li>
            • Para dar respuesta tenemos un plazo legal de hasta{' '}
            <strong className="text-foreground">30 días calendario</strong>,
            la cual se enviará al mismo correo.
          </li>
        </ul>

        <ComplaintForm />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          KODA · RUC pendiente · Lima, Perú
        </p>
      </div>
    </div>
  );
}
