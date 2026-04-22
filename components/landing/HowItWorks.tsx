import { UserPlusIcon, ClipboardListIcon, UtensilsCrossedIcon } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: UserPlusIcon,
    title: 'Regístrate y elige tu plan',
    description:
      'Crea tu cuenta en segundos y selecciona el plan que mejor se adapte a tus necesidades. Desde S/29 al mes.',
  },
  {
    number: '02',
    icon: ClipboardListIcon,
    title: 'Completa tu perfil de salud',
    description:
      'Cuéntanos tu edad, peso, estatura, objetivo y preferencias alimentarias. Solo toma 2 minutos.',
  },
  {
    number: '03',
    icon: UtensilsCrossedIcon,
    title: 'Recibe tu plan personalizado',
    description:
      'La IA genera tu plan de 30 días al instante: desayuno, media mañana, almuerzo, media tarde y cena cada día.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-background py-20 md:py-28">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Encabezado */}
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Cómo funciona
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            En tres pasos simples tienes tu plan personalizado listo para comenzar.
          </p>
        </div>

        {/* Pasos */}
        <div className="relative grid gap-10 md:grid-cols-3">
          {/* Línea conectora — visible solo en desktop */}
          <div
            aria-hidden
            className="absolute top-8 left-[calc(33%+1rem)] right-[calc(33%+1rem)] hidden h-px bg-border md:block"
          />

          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="flex flex-col items-center text-center">
              {/* Círculo numerado */}
              <div className="relative mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Icon className="size-7" />
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-background text-xs font-bold text-primary ring-2 ring-border">
                  {number}
                </span>
              </div>
              <h3 className="mb-3 font-display text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
