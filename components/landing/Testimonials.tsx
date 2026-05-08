import { StarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TESTIMONIALS = [
  {
    name: 'Valeria Huamán',
    location: 'Lima, Perú',
    result: 'Bajó 6 kg en 2 meses',
    avatar: 'VH',
    rating: 5,
    quote:
      'En la primera semana me sentí menos inflamada y más ligera. En el primer mes bajé 6 kilos sin dejar de comer lo que me gusta y ahora tengo una estructura clara.',
  },
  {
    name: 'Carlos Mendoza',
    location: 'Arequipa, Perú',
    result: 'Ganó 4 kg de músculo',
    avatar: 'CM',
    rating: 5,
    quote:
      'Lo que más me ayudó fue saber exactamente qué hacer. Ya no estoy improvisando en el gym ni con la comida.',
  },
  {
    name: 'Patricia Quispe',
    location: 'Cusco, Perú',
    result: 'Mejor energía y vitalidad',
    avatar: 'PQ',
    rating: 5,
    quote:
      'Tengo hipotiroidismo y siempre me costó bajar. Con el plan me siento con más energía y por fin veo cambios.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonios" className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Encabezado */}
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Personas reales con resultados reales. Sin dietas imposibles.
          </p>
        </div>

        {/* Grid de testimonios */}
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ name, location, result, avatar, rating, quote }) => (
            <Card key={name} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 pt-4">
                {/* Estrellas */}
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Cita */}
                <p className="flex-1 text-sm text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </p>

                {/* Usuario */}
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  {/* Avatar con iniciales */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{location}</p>
                  </div>
                  <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {result}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
