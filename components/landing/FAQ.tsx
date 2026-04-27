import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    question: '¿Qué es KODA y cómo funciona?',
    answer:
      'KODA es una plataforma que usa inteligencia artificial (Claude AI de Anthropic) para crear planes de alimentación de 30 días totalmente personalizados. Completas tu perfil con tus datos físicos y preferencias, y en menos de un minuto recibes un plan con 5 comidas diarias adaptadas a ti.',
  },
  {
    question: '¿Incluye alimentos peruanos?',
    answer:
      'Sí, eso es lo que nos diferencia. El plan incluye alimentos como quinua, kiwicha, ají amarillo, ceviche, lomo saltado, pollo a la brasa y muchos otros que encuentras fácilmente en cualquier mercado o restaurante de Perú.',
  },
  {
    question: '¿Qué pasa si tengo alergias o condiciones médicas?',
    answer:
      'Durante el onboarding puedes especificar tus alergias alimentarias, los alimentos que prefieres evitar y tus condiciones médicas. La IA tiene en cuenta toda esta información al generar tu plan. Sin embargo, te recomendamos siempre consultar con tu médico antes de iniciar cualquier dieta.',
  },
  {
    question: '¿Puedo cambiar mi plan si no me convence?',
    answer:
      'Sí. Dependiendo de tu plan, puedes regenerar tu dieta una o más veces por mes. El plan Estándar incluye 2 regeneraciones y el Premium es ilimitado. Si cambias tu objetivo (por ejemplo, de "perder peso" a "ganar músculo"), puedes actualizar tu perfil y generar un nuevo plan.',
  },
  {
    question: '¿Cómo se realizan los pagos?',
    answer:
      'Usamos Culqi, la principal pasarela de pagos peruana. Puedes pagar con tarjetas Visa y Mastercard peruanas (débito y crédito). El cobro es mensual y puedes cancelar en cualquier momento desde tu cuenta.',
  },
  {
    question: '¿Puedo descargar mi plan en PDF?',
    answer:
      'Sí, todos los planes incluyen la opción de descargar el plan completo en PDF. Puedes imprimirlo o guardarlo en tu celular para tenerlo siempre disponible, incluso sin internet.',
  },
  {
    question: '¿Qué pasa al final del mes?',
    answer:
      'Tu suscripción se renueva automáticamente cada mes. 5 días antes del vencimiento te enviamos un email de recordatorio. Al renovar, puedes elegir si quieres un plan completamente nuevo o actualizar tu perfil si algo ha cambiado.',
  },
  {
    question: '¿Es segura mi información personal?',
    answer:
      'Absolutamente. Tus datos se almacenan de forma segura en Supabase con cifrado en reposo. Solo tú tienes acceso a tu perfil de salud y plan de dieta. Nunca compartimos ni vendemos tu información personal a terceros.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Encabezado */}
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Todo lo que necesitas saber antes de empezar.
          </p>
        </div>

        {/* Acordeón */}
        <Accordion>
          {FAQS.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                {question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
