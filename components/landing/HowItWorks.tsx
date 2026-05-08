import { ClipboardListIcon, SparklesIcon, TrendingUpIcon } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: ClipboardListIcon,
    title: 'Responde sobre ti',
    description:
      'Cuéntanos tu objetivo, tu rutina y cómo es tu día a día.',
  },
  {
    number: '02',
    icon: SparklesIcon,
    title: 'Creamos tu plan',
    description:
      'KODA analiza tus respuestas y arma tu alimentación y entrenamiento.',
  },
  {
    number: '03',
    icon: TrendingUpIcon,
    title: 'Empieza y ajusta',
    description:
      'Sigues tu plan y lo vamos ajustando temporalmente.',
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
