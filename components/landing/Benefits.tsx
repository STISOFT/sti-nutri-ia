import {
  BrainIcon,
  UtensilsIcon,
  ClockIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  HeartIcon,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: BrainIcon,
    title: 'Generado por IA avanzada',
    description:
      'Claude AI analiza tus datos físicos, objetivos y preferencias para crear un plan 100% único para ti.',
  },
  {
    icon: UtensilsIcon,
    title: 'Comida peruana incluida',
    description:
      'Quinua, kiwicha, ají amarillo, ceviche... tu plan incluye alimentos que ya conoces y puedes conseguir fácilmente.',
  },
  {
    icon: ClockIcon,
    title: 'Listo en 60 segundos',
    description:
      'Completa tu perfil y en menos de un minuto tendrás un plan completo de 30 días con 5 comidas diarias.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Basado en nutrición real',
    description:
      'Planes balanceados con macros calculados (proteínas, carbos, grasas) según tus objetivos y nivel de actividad.',
  },
  {
    icon: RefreshCwIcon,
    title: 'Se renueva cada mes',
    description:
      'Nuevo plan cada mes automáticamente. Puedes regenerarlo cuando cambias de objetivo o quieres variedad.',
  },
  {
    icon: HeartIcon,
    title: 'Adaptado a ti',
    description:
      'Especificas alergias, alimentos que evitas y condiciones médicas. El plan respeta tus restricciones siempre.',
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Encabezado */}
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            ¿Por qué KODA?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            No es otra app de dieta genérica. Es tu plan personal, hecho a tu medida,
            con alimentos que realmente vas a encontrar en el mercado.
          </p>
        </div>

        {/* Grid de beneficios */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
