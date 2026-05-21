/**
 * Smoke test del clasificador del Bloque 4.
 * Corre con: `npx tsx scripts/smoke-classifier.ts`
 *
 * No es un test framework — solo asserts manuales. Si todos
 * los casos pasan, imprime un OK final. Si alguno falla, sale
 * con código distinto a 0.
 */
import { classifyProfile } from '../lib/method/classifier';
import type { QuizAnswers, ClassifiedProfile } from '../types/method';

let failures = 0;

function eq<T>(label: string, got: T, expected: T) {
  const ok = got === expected;
  console.log(`${ok ? '✓' : '✗'} ${label}: ${ok ? 'OK' : `expected ${String(expected)}, got ${String(got)}`}`);
  if (!ok) failures++;
}

function caseLabel(n: number, descr: string) {
  console.log(`\n── Caso ${n} · ${descr} ─────────────────────────────`);
}

// Base "buena" para clonar y mutar
const base: QuizAnswers = {
  q1_goal: 'perder_grasa',
  q2_body_description: 'gordiflaco',
  q3_training_frequency: '3_4',
  q4_main_difficulty: 'falta_tiempo',
  q5_meals_per_day: '3',
  q6_inflammation_perception: 'no',
  age: 30,
  weight_kg: 75,
  height_cm: 175,
  waist_cm: 90,
  wake_time: '06:30',
  work_time: '09:00',
  train_time: '18:00',
  sleep_time: '23:00',
  q9_training_type: 'pesas',
  q10_food_quality: 'casera',
  q10_typical_day: null,
  q11_digestion_symptoms: ['ninguno'],
  q12_post_meal_sensation: 'ligero',
  q13_sleep_hours: '7_8',
  q14_stress_level: 'bajo',
  q15_food_restrictions: null,
};

// ──────────────────────────────────────────────────────────────
// Caso 1 — Perfil ideal: gordiflaco con buena recuperación
// ──────────────────────────────────────────────────────────────
caseLabel(1, 'gordiflaco con buena recuperación');
let p: ClassifiedProfile = classifyProfile(base);
eq('body_type', p.body_type, 'baja_masa_grasa_localizada');
eq('activity_level', p.activity_level, 'moderado');
eq('inflammation', p.inflammation, 'baja');
eq('meal_structure', p.meal_structure, 'media');
eq('life_structure', p.life_structure, 'estructurada');
eq('food_quality', p.food_quality, 'alta');
eq('digestive_alert', p.digestive_alert, 'baja');
eq('recovery', p.recovery, 'alta');
// waist 90 / height 175 = 0.514 → alta
eq('abdominal_fat', p.abdominal_fat, 'alta');

// ──────────────────────────────────────────────────────────────
// Caso 2 — Inflamación alta (Q6=si_constantemente domina)
// ──────────────────────────────────────────────────────────────
caseLabel(2, 'inflamación alta por percepción constante');
p = classifyProfile({ ...base, q6_inflammation_perception: 'si_constantemente' });
eq('inflammation', p.inflammation, 'alta');

// ──────────────────────────────────────────────────────────────
// Caso 3 — Inflamación moderada (a veces + síntoma)
// ──────────────────────────────────────────────────────────────
caseLabel(3, 'inflamación moderada (a veces + gases)');
p = classifyProfile({
  ...base,
  q6_inflammation_perception: 'a_veces',
  q11_digestion_symptoms: ['gases'],
});
eq('inflammation', p.inflammation, 'moderada');

// ──────────────────────────────────────────────────────────────
// Caso 4 — Recuperación baja (estrés alto domina)
// ──────────────────────────────────────────────────────────────
caseLabel(4, 'recuperación baja por estrés alto');
p = classifyProfile({ ...base, q14_stress_level: 'alto' });
eq('recovery', p.recovery, 'baja');

// ──────────────────────────────────────────────────────────────
// Caso 5 — Sedentario con mala alimentación y vida desordenada
// ──────────────────────────────────────────────────────────────
caseLabel(5, 'sedentario, comida rápida, sin horarios');
p = classifyProfile({
  ...base,
  q2_body_description: 'acumulador_grasa',
  q3_training_frequency: 'no_entreno',
  q9_training_type: 'ninguno',
  q10_food_quality: 'comida_rapida',
  q5_meals_per_day: '1_2',
  q12_post_meal_sensation: 'pesado',
  q13_sleep_hours: 'menos_5',
  q14_stress_level: 'alto',
  wake_time: null,
  work_time: null,
  train_time: null,
  sleep_time: null,
  waist_cm: null,
});
eq('body_type', p.body_type, 'acumulador_grasa');
eq('activity_level', p.activity_level, 'sedentario');
eq('meal_structure', p.meal_structure, 'baja');
eq('food_quality', p.food_quality, 'baja');
eq('digestive_alert', p.digestive_alert, 'alta');
eq('life_structure', p.life_structure, 'desordenada');
eq('recovery', p.recovery, 'baja');
eq('abdominal_fat', p.abdominal_fat, 'no_clasificada');

// ──────────────────────────────────────────────────────────────
// Caso 6 — Ratio cintura/talla 0.46 → media
// ──────────────────────────────────────────────────────────────
caseLabel(6, 'ratio cintura/talla media');
p = classifyProfile({ ...base, waist_cm: 80.5, height_cm: 175 }); // 80.5/175 = 0.46
eq('abdominal_fat', p.abdominal_fat, 'media');

// ──────────────────────────────────────────────────────────────
// Resumen
// ──────────────────────────────────────────────────────────────
console.log('\n────────────────────────────────────────');
if (failures === 0) {
  console.log('✅ Todos los casos pasan.');
  process.exit(0);
} else {
  console.error(`❌ ${failures} aserción(es) fallaron.`);
  process.exit(1);
}
