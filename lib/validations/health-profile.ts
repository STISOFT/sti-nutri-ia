import { z } from 'zod';

// ── Paso 1: datos físicos ─────────────────────────────────────
export const step1Schema = z.object({
  age: z.coerce
    .number({ error: 'La edad es obligatoria' })
    .int('Ingresa un número entero')
    .min(14, 'Debes tener al menos 14 años')
    .max(100, 'Ingresa una edad válida'),
  weight_kg: z.coerce
    .number({ error: 'El peso es obligatorio' })
    .min(30, 'El peso mínimo es 30 kg')
    .max(300, 'Ingresa un peso válido'),
  height_cm: z.coerce
    .number({ error: 'La estatura es obligatoria' })
    .min(100, 'La estatura mínima es 100 cm')
    .max(250, 'Ingresa una estatura válida'),
});

// ── Paso 2: objetivo y actividad ──────────────────────────────
export const step2Schema = z.object({
  goal: z.enum(['perder_peso', 'ganar_peso', 'mantener_peso', 'ganar_musculo'], {
    error: 'Selecciona un objetivo',
  }),
  activity_level: z.enum(['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'], {
    error: 'Selecciona tu nivel de actividad',
  }),
});

// ── Paso 3: preferencias alimentarias ────────────────────────
export const step3Schema = z.object({
  preferred_foods: z.array(z.string()).default([]),
  avoided_foods: z.array(z.string()).default([]),
  food_allergies: z.array(z.string()).default([]),
  medical_conditions: z.string().default(''),
});

// ── Schema completo (para la API route) ───────────────────────
export const fullHealthProfileSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
});

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type HealthProfileInput = z.infer<typeof fullHealthProfileSchema>;
