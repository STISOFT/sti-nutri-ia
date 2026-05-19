import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Cambios y Devoluciones — KODA',
  description:
    'Conoce nuestra política de cambios, cancelación de suscripción y devoluciones, conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571).',
};

export default function CambiosYDevolucionesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Política de Cambios y Devoluciones
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: mayo 2026
      </p>

      <div className="mt-10 space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">
            1. Naturaleza del servicio
          </h2>
          <p>
            KODA es un servicio digital de suscripción mensual que genera planes
            de alimentación y entrenamiento personalizados mediante inteligencia
            artificial. Al tratarse de un servicio digital de ejecución
            inmediata, el plan se entrega y queda disponible apenas se completa
            el pago y el perfil del usuario.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">
            2. Cancelación de la suscripción
          </h2>
          <p>
            Puedes cancelar la renovación de tu suscripción en cualquier momento
            desde tu cuenta, en la sección{' '}
            <Link href="/suscripcion" className="text-primary hover:underline">
              Suscripción
            </Link>
            . La cancelación detiene el cobro del siguiente periodo; no genera un
            cobro adicional ni penalidad. Conservarás el acceso al plan vigente
            hasta el final del periodo ya pagado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">
            3. Devoluciones
          </h2>
          <p>
            Por tratarse de un servicio digital de acceso inmediato, una vez
            generado el plan no procede la devolución del importe del periodo en
            curso. Sin embargo, se realizará la devolución íntegra en los
            siguientes casos:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Cobro duplicado o cobro por un monto distinto al del plan contratado.</li>
            <li>
              Cobro efectuado luego de haber cancelado la suscripción dentro del
              plazo correspondiente.
            </li>
            <li>
              Falla técnica atribuible a KODA que impida la generación o el
              acceso al plan, y que no haya podido ser subsanada en un plazo
              razonable.
            </li>
            <li>
              Cobro no reconocido o no autorizado por el titular del medio de
              pago.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">
            4. Cómo solicitar una devolución
          </h2>
          <p>
            Para solicitar una devolución, escríbenos a{' '}
            <a
              href="mailto:contacto@koda-ia.com"
              className="text-primary hover:underline"
            >
              contacto@koda-ia.com
            </a>{' '}
            indicando el correo de tu cuenta, la fecha del cobro y el motivo. De
            forma alternativa, puedes registrar tu solicitud en nuestro{' '}
            <Link
              href="/libro-de-reclamaciones"
              className="text-primary hover:underline"
            >
              Libro de Reclamaciones
            </Link>
            .
          </p>
          <p className="mt-3">
            Evaluaremos tu solicitud y te daremos respuesta en un plazo máximo de{' '}
            <strong className="text-foreground">15 días hábiles</strong>. De
            proceder la devolución, esta se efectuará por el mismo medio de pago
            utilizado, en un plazo que dependerá de los tiempos de la entidad
            financiera y de la pasarela de pagos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">
            5. Cambio de plan
          </h2>
          <p>
            Puedes cambiar de plan (Inicio, Core o Pro) en cualquier momento. El
            cambio surte efecto en el siguiente periodo de facturación. Si
            actualizas a un plan superior, el nuevo precio se aplicará desde la
            siguiente renovación.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">
            6. Consideraciones de salud
          </h2>
          <p>
            Los planes generados por KODA son orientativos y no reemplazan la
            consulta con un profesional de la salud o nutricionista certificado.
            La insatisfacción con los resultados físicos o nutricionales, al
            depender de múltiples factores externos al servicio, no constituye
            por sí sola una causal de devolución.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">
            7. Atención al consumidor
          </h2>
          <p>
            Esta política se rige por el Código de Protección y Defensa del
            Consumidor (Ley N° 29571). Para cualquier consulta o reclamo puedes
            contactarnos a{' '}
            <a
              href="mailto:contacto@koda-ia.com"
              className="text-primary hover:underline"
            >
              contacto@koda-ia.com
            </a>{' '}
            o a través del{' '}
            <Link
              href="/libro-de-reclamaciones"
              className="text-primary hover:underline"
            >
              Libro de Reclamaciones
            </Link>
            .
          </p>
        </section>

        <section className="rounded-lg border border-border bg-muted/30 p-5 text-sm">
          <p>
            <strong className="text-foreground">Empresa responsable:</strong>{' '}
            3BMARKETPLACE S.A.C. · RUC 20613499572 · Jr. García Villón 199,
            Cercado de Lima, Perú · Telf. 932 421 460.
          </p>
        </section>
      </div>
    </main>
  );
}
