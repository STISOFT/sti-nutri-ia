import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad — KODA',
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-foreground">Política de Privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: abril 2026</p>

      <div className="mt-10 space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">1. Datos que recopilamos</h2>
          <p>
            Recopilamos los datos que nos proporcionas al registrarte (nombre, correo electrónico)
            y al completar tu perfil de salud (edad, peso, talla, objetivo, preferencias
            alimentarias). También recopilamos datos de uso de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">2. Uso de los datos</h2>
          <p>
            Usamos tus datos exclusivamente para generar tu plan de alimentación personalizado,
            enviarte notificaciones relacionadas con tu cuenta y mejorar nuestro servicio. Nunca
            vendemos tu información a terceros.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">3. Almacenamiento y seguridad</h2>
          <p>
            Tus datos se almacenan en servidores seguros con cifrado en tránsito (TLS) y en reposo.
            Utilizamos Supabase Auth para la gestión de identidad y PostgreSQL para el
            almacenamiento de datos de perfil.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">4. Datos de salud</h2>
          <p>
            Los datos de salud que ingresas (peso, talla, condiciones médicas) son tratados con
            especial confidencialidad. Solo son usados para generar tu plan personalizado y no son
            compartidos con terceros bajo ninguna circunstancia.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">5. Cookies</h2>
          <p>
            Usamos cookies esenciales para mantener tu sesión activa. No usamos cookies de
            publicidad ni de rastreo de terceros.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">6. Tus derechos</h2>
          <p>
            Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier
            momento. Para ejercer estos derechos, contáctanos en{' '}
            <a href="mailto:hola@nutriia.pe" className="text-primary underline hover:opacity-80">
              hola@nutriia.pe
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">7. Eliminación de cuenta</h2>
          <p>
            Al eliminar tu cuenta, todos tus datos personales y planes de alimentación serán
            borrados de nuestros sistemas de forma permanente en un plazo máximo de 30 días.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">8. Contacto</h2>
          <p>
            Para consultas sobre privacidad, escríbenos a{' '}
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
