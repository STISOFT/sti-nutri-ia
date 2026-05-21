// ============================================================
// CLASIFICADOR — Método - Pérdida de Grasa (Bloque 4)
//
// Convierte las respuestas crudas del formulario (QuizAnswers)
// en un perfil estructurado (ClassifiedProfile) según las
// 12 reglas determinísticas del Bloque 4.
//
// Todas las funciones son puras (mismo input → mismo output)
// y sin side effects, para poder testearse trivialmente.
// ============================================================

import type {
  ActivityLevel,
  AbdominalFat,
  BodyType,
  ClassifiedProfile,
  DigestionSymptom,
  InflammationLevel,
  LevelLMH,
  LifeStructure,
  MainDifficulty,
  QuizAnswers,
} from '@/types/method';

// ───── 1 · Tipo de cuerpo (Bloque 4 regla 2) ────────────────
export function classifyBodyType(
  q2: QuizAnswers['q2_body_description']
): BodyType {
  switch (q2) {
    case 'delgado':
      return 'delgado';
    case 'acumulador_grasa':
      return 'acumulador_grasa';
    case 'gordiflaco':
      return 'baja_masa_grasa_localizada';
  }
}

// ───── 2 · Nivel de actividad (regla 3) ─────────────────────
export function classifyActivityLevel(
  q3: QuizAnswers['q3_training_frequency']
): ActivityLevel {
  switch (q3) {
    case 'no_entreno':
      return 'sedentario';
    case '1_2':
      return 'bajo';
    case '3_4':
      return 'moderado';
    case '5_o_mas':
      return 'alto';
  }
}

// ───── 3 · Inflamación (regla 4) ────────────────────────────
// Combina percepción (Q6) con síntomas digestivos (Q11).
// Q6 = "Sí, constantemente"                                → alta
// Q6 = "A veces"  Y  Q11 con ≥1 síntoma (no "ninguno")     → moderada
// Q6 = "No"       Y  Q11 = ["ninguno"]                     → baja
// Cualquier otra combinación cae a "moderada" por defecto
// (interpretación conservadora cuando la respuesta es ambigua).
export function classifyInflammation(
  q6: QuizAnswers['q6_inflammation_perception'],
  q11: DigestionSymptom[]
): InflammationLevel {
  const hasSymptoms = q11.some((s) => s !== 'ninguno');

  if (q6 === 'si_constantemente') return 'alta';
  if (q6 === 'a_veces' && hasSymptoms) return 'moderada';
  if (q6 === 'no' && !hasSymptoms) return 'baja';

  // Casos mixtos: Q6 = 'a_veces' sin síntomas, o Q6 = 'no' con síntomas
  return 'moderada';
}

// ───── 4 · Dificultad principal (regla 5) ───────────────────
// Copia directa de la respuesta del usuario.
export function classifyDifficulty(
  q4: QuizAnswers['q4_main_difficulty']
): MainDifficulty {
  return q4;
}

// ───── 5 · Estructura alimentaria (regla 6) ─────────────────
export function classifyMealStructure(
  q5: QuizAnswers['q5_meals_per_day']
): LevelLMH {
  switch (q5) {
    case '1_2':
      return 'baja';
    case '3':
      return 'media';
    case '4_5':
      return 'alta';
  }
}

// ───── 6 · Estructura de vida (regla 7) ─────────────────────
// Se infiere de cuántos horarios (Q8) tiene definidos el usuario.
// 0–1 horarios   → desordenada
// 2–3 horarios   → moderada
// 4 horarios     → estructurada
export function classifyLifeStructure(args: {
  wake_time?: string | null;
  work_time?: string | null;
  train_time?: string | null;
  sleep_time?: string | null;
}): LifeStructure {
  const filled = [args.wake_time, args.work_time, args.train_time, args.sleep_time]
    .filter((t) => typeof t === 'string' && t.trim() !== '').length;

  if (filled <= 1) return 'desordenada';
  if (filled <= 3) return 'moderada';
  return 'estructurada';
}

// ───── 7 · Calidad de alimentación (regla 8) ────────────────
export function classifyFoodQuality(
  q10: QuizAnswers['q10_food_quality']
): LevelLMH {
  switch (q10) {
    case 'comida_rapida':
      return 'baja';
    case 'mezcla':
      return 'media';
    case 'casera':
      return 'alta';
  }
}

// ───── 8 · Alerta digestiva (regla 9) ───────────────────────
export function classifyDigestiveAlert(
  q12: QuizAnswers['q12_post_meal_sensation']
): LevelLMH {
  switch (q12) {
    case 'pesado':
    case 'inflamado':
      return 'alta';
    case 'con_sueno':
      return 'media';
    case 'ligero':
      return 'baja';
  }
}

// ───── 9 · Recuperación (regla 10) ──────────────────────────
// Regla de prioridad: factores negativos dominan.
// SI sueño < 6   O   estrés = alto         → baja
// SI sueño 7–8   Y   estrés = bajo         → alta
// SI sueño > 8   Y   estrés = bajo         → alta
// Otros (sueño 5_6 / 7_8 / mas_8 con estrés ≠ extremo) → media
export function classifyRecovery(
  q13: QuizAnswers['q13_sleep_hours'],
  q14: QuizAnswers['q14_stress_level']
): LevelLMH {
  // Sueño bajo o estrés alto → baja (factor negativo domina)
  if (q13 === 'menos_5' || q14 === 'alto') return 'baja';

  // 7-8 horas o más, con bajo estrés → alta
  if ((q13 === '7_8' || q13 === 'mas_8') && q14 === 'bajo') return 'alta';

  // Resto: combinaciones medias (5_6 con bajo/medio estrés, 7_8 con medio, etc.)
  return 'media';
}

// ───── 10 · Grasa abdominal (regla 12) ──────────────────────
// Ratio cintura/talla:
//   ≥ 0.50        → alta
//   0.45 – 0.49   → media
//   < 0.45        → baja
// Si no hay dato de cintura → no_clasificada (regla del PDF).
export function classifyAbdominalFat(
  waist_cm: number | null | undefined,
  height_cm: number
): AbdominalFat {
  if (waist_cm == null || height_cm <= 0) return 'no_clasificada';

  const ratio = waist_cm / height_cm;
  if (ratio >= 0.5) return 'alta';
  if (ratio >= 0.45) return 'media';
  return 'baja';
}

// ───── Orquestador ─────────────────────────────────────────
// Aplica las 10 reglas + copia restricciones (regla 11).
export function classifyProfile(a: QuizAnswers): ClassifiedProfile {
  return {
    body_type: classifyBodyType(a.q2_body_description),
    activity_level: classifyActivityLevel(a.q3_training_frequency),
    inflammation: classifyInflammation(a.q6_inflammation_perception, a.q11_digestion_symptoms),
    difficulty: classifyDifficulty(a.q4_main_difficulty),
    meal_structure: classifyMealStructure(a.q5_meals_per_day),
    life_structure: classifyLifeStructure({
      wake_time: a.wake_time ?? null,
      work_time: a.work_time ?? null,
      train_time: a.train_time ?? null,
      sleep_time: a.sleep_time ?? null,
    }),
    food_quality: classifyFoodQuality(a.q10_food_quality),
    digestive_alert: classifyDigestiveAlert(a.q12_post_meal_sensation),
    recovery: classifyRecovery(a.q13_sleep_hours, a.q14_stress_level),
    abdominal_fat: classifyAbdominalFat(a.waist_cm ?? null, a.height_cm),
    food_restrictions: (a.q15_food_restrictions ?? '').trim(),
  };
}
