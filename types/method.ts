// ============================================================
// MÉTODO — PÉRDIDA DE GRASA
// Tipos del sistema definidos en el documento
// "MÉTODO - PERDIDA DE GRASA AVANCE 4" (Bloques 1-8).
//
// Estructura:
//   QuizAnswers        → Bloque 3 (formulario de 15 preguntas)
//   ClassifiedProfile  → Bloque 4 (12 variables interpretadas)
//   Requirements       → Bloque 5 (calorías + macros)
//   KodaPlan           → Bloques 6 + 8 (output completo: nutrición + entrenamiento + recuperación)
// ============================================================

// ───────────────────────────────────────────────────────────
// BLOQUE 3 · Respuestas del formulario
// ───────────────────────────────────────────────────────────

export const GOALS = ['perder_grasa'] as const; // Únicamente perder grasa (Bloque 4 regla 1)
export type Goal = (typeof GOALS)[number];

export const BODY_DESCRIPTIONS = [
  'delgado',            // me cuesta ganar masa
  'acumulador_grasa',   // complexión ancha
  'gordiflaco',         // delgado pero con grasa localizada
] as const;
export type BodyDescription = (typeof BODY_DESCRIPTIONS)[number];

export const TRAINING_FREQUENCIES = ['no_entreno', '1_2', '3_4', '5_o_mas'] as const;
export type TrainingFrequency = (typeof TRAINING_FREQUENCIES)[number];

export const MAIN_DIFFICULTIES = [
  'falta_tiempo',
  'ansiedad_hambre',
  'no_se_que_comer',
  'falta_constancia',
] as const;
export type MainDifficulty = (typeof MAIN_DIFFICULTIES)[number];

export const MEALS_PER_DAY = ['1_2', '3', '4_5'] as const;
export type MealsPerDay = (typeof MEALS_PER_DAY)[number];

export const INFLAMMATION_PERCEPTIONS = ['si_constantemente', 'a_veces', 'no'] as const;
export type InflammationPerception = (typeof INFLAMMATION_PERCEPTIONS)[number];

export const TRAINING_TYPES = ['pesas', 'cardio', 'ambos', 'ninguno'] as const;
export type TrainingType = (typeof TRAINING_TYPES)[number];

export const FOOD_QUALITIES = ['casera', 'comida_rapida', 'mezcla'] as const;
export type FoodQuality = (typeof FOOD_QUALITIES)[number];

export const DIGESTION_SYMPTOMS = [
  'gases',
  'estrenimiento',
  'digestion_pesada',
  'ninguno',
] as const;
export type DigestionSymptom = (typeof DIGESTION_SYMPTOMS)[number];

export const POST_MEAL_SENSATIONS = ['ligero', 'pesado', 'con_sueno', 'inflamado'] as const;
export type PostMealSensation = (typeof POST_MEAL_SENSATIONS)[number];

export const SLEEP_HOURS = ['menos_5', '5_6', '7_8', 'mas_8'] as const;
export type SleepHours = (typeof SLEEP_HOURS)[number];

export const STRESS_LEVELS = ['bajo', 'medio', 'alto'] as const;
export type StressLevel = (typeof STRESS_LEVELS)[number];

/**
 * Respuestas crudas del formulario de evaluación inicial (Bloque 3).
 * Cada campo tiene un sufijo qN para mantener trazabilidad con el documento del método.
 */
export interface QuizAnswers {
  // Fase 1 — Quiz rápido
  q1_goal: Goal;
  q2_body_description: BodyDescription;
  q3_training_frequency: TrainingFrequency;
  q4_main_difficulty: MainDifficulty;
  q5_meals_per_day: MealsPerDay;
  q6_inflammation_perception: InflammationPerception;

  // Fase 2 — Evaluación detallada
  // Q7 — Datos físicos
  age: number;
  weight_kg: number;
  height_cm: number;
  waist_cm?: number | null;

  // Q8 — Horarios (HH:MM, opcionales individualmente)
  wake_time?: string | null;
  work_time?: string | null;
  train_time?: string | null;
  sleep_time?: string | null;

  // Q9
  q9_training_type: TrainingType;

  // Q10
  q10_food_quality: FoodQuality;
  q10_typical_day?: string | null;

  // Q11 — multi-select
  q11_digestion_symptoms: DigestionSymptom[];

  // Q12
  q12_post_meal_sensation: PostMealSensation;

  // Q13
  q13_sleep_hours: SleepHours;

  // Q14
  q14_stress_level: StressLevel;

  // Q15 — texto libre
  q15_food_restrictions?: string | null;
}

// ───────────────────────────────────────────────────────────
// BLOQUE 4 · Variables clasificadas
// ───────────────────────────────────────────────────────────

export const BODY_TYPES = [
  'delgado',
  'acumulador_grasa',
  'baja_masa_grasa_localizada',
] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const ACTIVITY_LEVELS = ['sedentario', 'bajo', 'moderado', 'alto'] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const LEVEL_LMH = ['baja', 'media', 'alta'] as const;
export type LevelLMH = (typeof LEVEL_LMH)[number];

export const INFLAMMATION_LEVELS = ['alta', 'moderada', 'baja'] as const;
export type InflammationLevel = (typeof INFLAMMATION_LEVELS)[number];

export const LIFE_STRUCTURES = ['desordenada', 'moderada', 'estructurada'] as const;
export type LifeStructure = (typeof LIFE_STRUCTURES)[number];

export const ABDOMINAL_FATS = ['alta', 'media', 'baja', 'no_clasificada'] as const;
export type AbdominalFat = (typeof ABDOMINAL_FATS)[number];

/**
 * Perfil clasificado producido por el motor de interpretación (Bloque 4).
 * Todos los campos opcionales hasta que el clasificador los calcule.
 */
export interface ClassifiedProfile {
  body_type: BodyType;
  activity_level: ActivityLevel;
  inflammation: InflammationLevel;
  difficulty: MainDifficulty;     // copia directa de q4_main_difficulty
  meal_structure: LevelLMH;
  life_structure: LifeStructure;
  food_quality: LevelLMH;
  digestive_alert: LevelLMH;
  recovery: LevelLMH;
  abdominal_fat: AbdominalFat;
  food_restrictions: string;      // texto libre de q15 (vacío si no hay)
}

// ───────────────────────────────────────────────────────────
// BLOQUE 5 · Requerimientos calculados
// ───────────────────────────────────────────────────────────

export const DEFICIT_TYPES = ['conservador', 'moderado'] as const;
export type DeficitType = (typeof DEFICIT_TYPES)[number];

/**
 * Resultado del cálculo de requerimientos energéticos (Bloque 5).
 * Las calorías se expresan como rango (min/max).
 */
export interface Requirements {
  maintenance_kcal: { min: number; max: number };
  target_kcal: { min: number; max: number };
  deficit_type: DeficitType;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
}

// ───────────────────────────────────────────────────────────
// BLOQUES 6 + 8 · Plan completo (output final)
// ───────────────────────────────────────────────────────────

/**
 * Sección de nutrición del plan (6.1 – 6.4 + 8.2).
 * Las recomendaciones se expresan como texto en español; las cantidades
 * concretas vienen en Requirements para mantener una única fuente de verdad.
 */
export interface NutritionPlan {
  // 6.1 — Estructura base
  meal_count: 2 | 3 | 4 | 5;
  daily_distribution: string;   // descripción textual de la distribución
  flexibility_notes: string;    // notas sobre flexibilidad

  // 6.2 — Distribución de macronutrientes
  protein_distribution: string;
  carbs_distribution: string;
  fats_distribution: string;

  // 6.3 — Selección de alimentos
  recommended_foods: string[];
  foods_to_avoid: string[];
  food_notes: string;

  // 6.4 — Intervenciones específicas activas para este usuario
  // (ej. "agua de jamaica", "papaya", "chía hidratada", "vinagre de manzana")
  interventions: NutritionIntervention[];
}

export interface NutritionIntervention {
  name: string;
  reason: string;     // por qué se aplica (ej. "inflamación alta")
  how_to_apply: string;
}

/**
 * Sección de entrenamiento (6.5 – 6.10 + 8.3).
 */
export interface TrainingPlan {
  // 6.5 — Estructura base
  weekly_frequency: number;            // días por semana
  routine_type: RoutineType;
  session_duration_min: number;        // promedio 30-75
  weekly_distribution: string;         // ej. "Lunes / Miércoles / Viernes"

  // 6.6 + 6.7 — Ejercicios y volumen por sesión
  sessions: TrainingSession[];

  // 6.8 — Cardio
  cardio: CardioPlan;

  // 6.9 — Intervenciones de entrenamiento aplicadas (si las hay)
  interventions: string[];

  // 6.10 — Core
  core: CorePlan;
}

export const ROUTINE_TYPES = ['full_body', 'upper_lower', 'ppl_ul', 'ppl_x2'] as const;
export type RoutineType = (typeof ROUTINE_TYPES)[number];

export interface TrainingSession {
  day_label: string;                   // "Día 1 — Full Body" o "Lunes — Upper"
  exercises: TrainingExercise[];
}

export interface TrainingExercise {
  name: string;                        // "Sentadilla", "Press inclinado"
  category: ExerciseCategory;
  series: number;                      // típico 2-4
  reps: string;                        // "8-12", "12-15"
  rir: string;                         // "1-3"
  notes?: string;
}

export const EXERCISE_CATEGORIES = ['base', 'complementario', 'aislado'] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const CARDIO_TYPES = ['liss', 'hiit', 'mixto', 'ninguno'] as const;
export type CardioType = (typeof CARDIO_TYPES)[number];

export interface CardioPlan {
  type: CardioType;
  weekly_frequency: number;            // 0-5
  duration_min: number;                // 0-45
  placement: string;                   // "post-entrenamiento" | "días separados" | "ayunas"
  notes: string;
}

export interface CorePlan {
  weekly_frequency: number;            // 2-4
  total_weekly_series: number;         // 6-12
  exercises: string[];                 // "Plancha", "Rueda abdominal", etc.
}

/**
 * Sección de recuperación y estilo de vida (6.11 – 6.15 + 8.4).
 */
export interface RecoveryPlan {
  sleep: {
    recommendation: string;
    target_hours: string;              // "7-8"
  };
  hydration: {
    daily_target_ml: number;           // ej. 2500
    interventions: string[];           // "agua de jamaica", "electrolitos"
    notes: string;
  };
  neat: {
    daily_steps_target: number;        // ej. 8000
    recommendations: string[];         // "caminatas", "pausas activas"
  };
  organization: {
    recommendation: string;
    practical_tips: string[];
  };
  stress: {
    recommendation: string;
    interventions: string[];           // "exposición solar", "pausas activas"
  };
}

/**
 * Output completo del sistema (Bloque 8).
 * Es lo que se persiste en DietPlan.plan_data tras renombrar conceptualmente.
 */
export interface KodaPlan {
  nutrition: NutritionPlan;
  training: TrainingPlan;
  recovery: RecoveryPlan;
  requirements: Requirements;
  // Frecuencia de seguimiento del Bloque 8.6 (depende del nivel de plan adquirido)
  follow_up: {
    frequency: 'sin_seguimiento' | 'semanal' | 'quincenal' | 'mensual';
    next_review_at?: string | null;    // ISO date
  };
  meta: {
    method_version: string;            // ej. "perdida-grasa-v4"
    generated_at: string;              // ISO date
    plan_tier: 'inicio' | 'core' | 'pro';
  };
}
