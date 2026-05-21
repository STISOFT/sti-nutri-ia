import { z } from 'zod';
import {
  GOALS,
  BODY_DESCRIPTIONS,
  TRAINING_FREQUENCIES,
  MAIN_DIFFICULTIES,
  MEALS_PER_DAY,
  INFLAMMATION_PERCEPTIONS,
  TRAINING_TYPES,
  FOOD_QUALITIES,
  DIGESTION_SYMPTOMS,
  POST_MEAL_SENSATIONS,
  SLEEP_HOURS,
  STRESS_LEVELS,
} from '@/types/method';

// ============================================================
// VALIDACIONES — Método - Pérdida de Grasa (Bloque 3)
// Schema Zod para el formulario de evaluación inicial (15 Q).
// ============================================================

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = z
  .string()
  .regex(HHMM, 'Formato debe ser HH:MM (ej. 07:30)')
  .optional()
  .or(z.literal(''));

const trimmedShortText = (max = 500) =>
  z.string().trim().max(max).optional().or(z.literal(''));

export const quizAnswersSchema = z.object({
  // ─── Fase 1 — Quiz rápido (Q1-Q6) ─────────────────────────
  q1_goal: z.enum(GOALS, { message: 'Objetivo no válido' }),

  q2_body_description: z.enum(BODY_DESCRIPTIONS, {
    message: 'Selecciona cómo te describes físicamente',
  }),

  q3_training_frequency: z.enum(TRAINING_FREQUENCIES, {
    message: 'Indica con qué frecuencia entrenas',
  }),

  q4_main_difficulty: z.enum(MAIN_DIFFICULTIES, {
    message: 'Selecciona tu mayor dificultad actual',
  }),

  q5_meals_per_day: z.enum(MEALS_PER_DAY, {
    message: 'Indica cuántas veces comes al día',
  }),

  q6_inflammation_perception: z.enum(INFLAMMATION_PERCEPTIONS, {
    message: 'Indica si te sientes inflamado durante el día',
  }),

  // ─── Fase 2 — Evaluación detallada (Q7-Q15) ───────────────
  // Q7 — Datos físicos
  age: z
    .number({ message: 'Edad inválida' })
    .int()
    .min(16, 'Edad mínima 16 años')
    .max(90, 'Edad máxima 90 años'),
  weight_kg: z
    .number({ message: 'Peso inválido' })
    .min(35, 'Peso mínimo 35 kg')
    .max(250, 'Peso máximo 250 kg'),
  height_cm: z
    .number({ message: 'Estatura inválida' })
    .min(130, 'Estatura mínima 130 cm')
    .max(220, 'Estatura máxima 220 cm'),
  waist_cm: z
    .number()
    .min(40, 'Cintura mínima 40 cm')
    .max(200, 'Cintura máxima 200 cm')
    .optional()
    .nullable(),

  // Q8 — Horarios
  wake_time: timeField,
  work_time: timeField,
  train_time: timeField,
  sleep_time: timeField,

  // Q9 — Tipo de entrenamiento
  q9_training_type: z.enum(TRAINING_TYPES, {
    message: 'Selecciona el tipo de entrenamiento',
  }),

  // Q10 — Alimentación actual
  q10_food_quality: z.enum(FOOD_QUALITIES, {
    message: 'Selecciona cómo es tu alimentación',
  }),
  q10_typical_day: trimmedShortText(500),

  // Q11 — Síntomas digestivos (multi-select; al menos 1)
  q11_digestion_symptoms: z
    .array(z.enum(DIGESTION_SYMPTOMS))
    .min(1, 'Selecciona al menos una opción')
    .refine(
      (arr) => {
        // Si "ninguno" está seleccionado, no debe ir junto a otros síntomas
        const hasNone = arr.includes('ninguno');
        const hasOthers = arr.some((s) => s !== 'ninguno');
        return !(hasNone && hasOthers);
      },
      { message: 'No puedes combinar "Ninguno" con otros síntomas' }
    ),

  // Q12 — Sensación después de comer
  q12_post_meal_sensation: z.enum(POST_MEAL_SENSATIONS, {
    message: 'Selecciona cómo te sientes después de comer',
  }),

  // Q13 — Sueño
  q13_sleep_hours: z.enum(SLEEP_HOURS, {
    message: 'Indica cuántas horas duermes',
  }),

  // Q14 — Estrés
  q14_stress_level: z.enum(STRESS_LEVELS, {
    message: 'Indica tu nivel de estrés',
  }),

  // Q15 — Restricciones (texto libre, corto)
  q15_food_restrictions: trimmedShortText(300),
});

export type QuizAnswersInput = z.infer<typeof quizAnswersSchema>;

// Schemas parciales por step (usado por el formulario multi-paso para
// validar antes de avanzar al siguiente step sin requerir todo el form).
export const stepSchemas = {
  step1: quizAnswersSchema.pick({
    age: true,
    weight_kg: true,
    height_cm: true,
    waist_cm: true,
  }),
  step2: quizAnswersSchema.pick({
    q2_body_description: true,
    q3_training_frequency: true,
    q9_training_type: true,
  }),
  step3: quizAnswersSchema.pick({
    wake_time: true,
    work_time: true,
    train_time: true,
    sleep_time: true,
    q13_sleep_hours: true,
  }),
  step4: quizAnswersSchema.pick({
    q5_meals_per_day: true,
    q10_food_quality: true,
    q10_typical_day: true,
    q15_food_restrictions: true,
  }),
  step5: quizAnswersSchema.pick({
    q6_inflammation_perception: true,
    q11_digestion_symptoms: true,
    q12_post_meal_sensation: true,
  }),
  step6: quizAnswersSchema.pick({
    q4_main_difficulty: true,
    q14_stress_level: true,
  }),
};
