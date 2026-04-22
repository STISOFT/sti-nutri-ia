import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos de Servicio — NutriIA',
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-foreground">Términos de Servicio</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: abril 2026</p>

      <div className="mt-10 space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">1. Aceptación de los términos</h2>
          <p>
            Al acceder o usar NutriIA, aceptas estar sujeto a estos Términos de Servicio. Si no
            estás de acuerdo, no debes usar el servicio.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">2. Descripción del servicio</h2>
          <p>
            NutriIA es una plataforma SaaS que genera planes de alimentación personalizados
            utilizando inteligencia artificial. Los planes son orientativos y no reemplazan la
            consulta con un profesional de la salud o nutricionista certificado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">3. Uso aceptable</h2>
          <p>
            Te comprometes a usar NutriIA únicamente para fines personales y no comerciales. Está
            prohibido compartir, revender o redistribuir los planes generados.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">4. Suscripciones y pagos</h2>
          <p>
            Los planes de suscripción se renuevan automáticamente cada mes. Puedes cancelar en
            cualquier momento desde tu panel de cuenta. No se realizan reembolsos por períodos
            parciales.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">5. Limitación de responsabilidad</h2>
          <p>
            NutriIA no se responsabiliza por resultados específicos de salud derivados del uso de
            los planes generados. Consulta siempre a un profesional médico antes de iniciar
            cualquier dieta.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">6. Cambios a los términos</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Te
            notificaremos por correo electrónico con al menos 15 días de anticipación ante cambios
            significativos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">7. Contacto</h2>
          <p>
            Para consultas sobre estos términos, escríbenos a{' '}
            <a href="mailto:hola@nutriia.pe" className="text-primary underline hover:opacity-80">
              hola@nutriia.pe
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
