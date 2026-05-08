import {
  UserIcon,
  CompassIcon,
  SparkleIcon,
  ClockIcon,
  RefreshCwIcon,
  BrainIcon,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: UserIcon,
    title: 'Hecho para ti',
    description:
      'No es una dieta genérica. Se adapta a tu cuerpo, tu objetivo y tu rutina diaria.',
  },
  {
    icon: CompassIcon,
    title: 'Deja de adivinar',
    description:
      'Sabes qué comer, cuánto y cuándo, sin estar probando cosas todo el tiempo.',
  },
  {
    icon: SparkleIcon,
    title: 'Menos inflamación',
    description:
      'Comes mejor, te sientes más ligero y tu digestión mejora desde los primeros días.',
  },
  {
    icon: ClockIcon,
    title: 'Listo en segundos',
    description:
      'Completa tu perfil y en menos de un minuto tienes tu plan completo.',
  },
  {
    icon: RefreshCwIcon,
    title: 'Seguimiento real',
    description:
      'Tu plan se ajusta contigo. No te quedas solo ni haciendo lo mismo siempre.',
  },
  {
    icon: BrainIcon,
    title: 'Entiende lo que haces',
    description:
      'No solo sigues un plan. Empiezas a entender qué le funciona a tu cuerpo.',
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
