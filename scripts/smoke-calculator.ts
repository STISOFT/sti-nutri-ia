/**
 * Smoke test de la calculadora del Bloque 5.
 * Corre con: `npx tsx scripts/smoke-calculator.ts`
 */
import {
  calculateMaintenanceKcal,
  selectDeficitType,
  calculateTargetKcal,
  calculateProteinGrams,
  calculateFatsGrams,
  calculateCarbsGrams,
  calculateRequirements,
} from '../lib/method/calculator';

let failures = 0;

function eq<T>(label: string, got: T, expected: T) {
  const ok = got === expected;
  console.log(
    `${ok ? '✓' : '✗'} ${label}: ${
      ok ? `OK (${String(got)})` : `expected ${String(expected)}, got ${String(got)}`
    }`
  );
  if (!ok) failures++;
}

function caseLabel(n: number, descr: string) {
  console.log(`\n── Caso ${n} · ${descr} ─────────────────────────────`);
}

// ──────────────────────────────────────────────────────────────
// Caso 1 — Mantenimiento por nivel de actividad (peso 75 kg)
// Sedentario: 75*28..30 = 2100..2250
// Bajo:       75*30..32 = 2250..2400
// Moderado:   75*32..34 = 2400..2550
// Alto:       75*34..36 = 2550..2700
// ──────────────────────────────────────────────────────────────
caseLabel(1, 'mantenimiento por nivel (peso 75 kg)');
let m = calculateMaintenanceKcal(75, 'sedentario');
eq('sedentario.min', m.min, 2100);
eq('sedentario.max', m.max, 2250);

m = calculateMaintenanceKcal(75, 'bajo');
eq('bajo.min', m.min, 2250);
eq('bajo.max', m.max, 2400);

m = calculateMaintenanceKcal(75, 'moderado');
eq('moderado.min', m.min, 2400);
eq('moderado.max', m.max, 2550);

m = calculateMaintenanceKcal(75, 'alto');
eq('alto.min', m.min, 2550);
eq('alto.max', m.max, 2700);

// ──────────────────────────────────────────────────────────────
// Caso 2 — Déficit moderado (todas las condiciones favorables)
// ──────────────────────────────────────────────────────────────
caseLabel(2, 'déficit moderado (recuperación alta + actividad moderada + sin inflamación)');
let d = selectDeficitType({
  recovery: 'alta',
  inflammation: 'baja',
  activity_level: 'moderado',
});
eq('deficit_type', d, 'moderado');

// ──────────────────────────────────────────────────────────────
// Caso 3 — Déficit conservador por recuperación baja
// ──────────────────────────────────────────────────────────────
caseLabel(3, 'déficit conservador por recuperación baja');
d = selectDeficitType({
  recovery: 'baja',
  inflammation: 'baja',
  activity_level: 'alto',
});
eq('deficit_type', d, 'conservador');

// ──────────────────────────────────────────────────────────────
// Caso 4 — Déficit conservador por inflamación alta
// ──────────────────────────────────────────────────────────────
caseLabel(4, 'déficit conservador por inflamación alta');
d = selectDeficitType({
  recovery: 'alta',
  inflammation: 'alta',
  activity_level: 'alto',
});
eq('deficit_type', d, 'conservador');

// ──────────────────────────────────────────────────────────────
// Caso 5 — Déficit conservador por baja actividad
// ──────────────────────────────────────────────────────────────
caseLabel(5, 'déficit conservador por sedentarismo');
d = selectDeficitType({
  recovery: 'alta',
  inflammation: 'baja',
  activity_level: 'sedentario',
});
eq('deficit_type', d, 'conservador');

// ──────────────────────────────────────────────────────────────
// Caso 6 — Target kcal según tipo de déficit
// ──────────────────────────────────────────────────────────────
caseLabel(6, 'target kcal con déficit conservador y moderado');
let t = calculateTargetKcal({ min: 2400, max: 2550 }, 'conservador');
eq('conservador.min', t.min, 2100); // 2400 - 300
eq('conservador.max', t.max, 2250); // 2550 - 300

t = calculateTargetKcal({ min: 2400, max: 2550 }, 'moderado');
eq('moderado.min', t.min, 1900); // 2400 - 500
eq('moderado.max', t.max, 2150); // 2550 - 400

// ──────────────────────────────────────────────────────────────
// Caso 7 — Proteína por tipo de cuerpo (75 kg)
// ──────────────────────────────────────────────────────────────
caseLabel(7, 'proteína por tipo de cuerpo (75 kg)');
eq('gordiflaco', calculateProteinGrams(75, 'baja_masa_grasa_localizada'), Math.round(75 * 2.1)); // 158
eq('delgado', calculateProteinGrams(75, 'delgado'), Math.round(75 * 1.9)); // 143
eq('acumulador', calculateProteinGrams(75, 'acumulador_grasa'), Math.round(75 * 2.0)); // 150

// ──────────────────────────────────────────────────────────────
// Caso 8 — Grasas (75 kg)
// ──────────────────────────────────────────────────────────────
caseLabel(8, 'grasas según inflamación (75 kg)');
eq('sin inflamación', calculateFatsGrams(75, 'baja'), Math.round(75 * 0.9)); // 68
eq('inflamación alta', calculateFatsGrams(75, 'alta'), Math.round(75 * 0.95)); // 71

// ──────────────────────────────────────────────────────────────
// Caso 9 — Carbohidratos (cálculo coherente)
// ──────────────────────────────────────────────────────────────
caseLabel(9, 'carbohidratos por resta calórica');
// target_kcal promedio = 2025 (entre 1900 y 2150)
// proteína 150 g = 600 kcal
// grasa 68 g = 612 kcal
// carbs kcal = 2025 - 600 - 612 = 813 kcal → 203 g
const carbs = calculateCarbsGrams({
  target_kcal: { min: 1900, max: 2150 },
  protein_g: 150,
  fats_g: 68,
});
eq('carbs ≈ 203 g', carbs, 203);

// ──────────────────────────────────────────────────────────────
// Caso 10 — Orquestador completo
// Perfil: 75 kg, gordiflaco, moderado, sin inflamación, recovery alta
// ──────────────────────────────────────────────────────────────
caseLabel(10, 'orquestador completo (75kg, gordiflaco, moderado, recovery alta)');
const req = calculateRequirements({
  weight_kg: 75,
  body_type: 'baja_masa_grasa_localizada',
  activity_level: 'moderado',
  inflammation: 'baja',
  recovery: 'alta',
});
eq('maintenance.min', req.maintenance_kcal.min, 2400);
eq('maintenance.max', req.maintenance_kcal.max, 2550);
eq('deficit_type', req.deficit_type, 'moderado');
eq('target.min', req.target_kcal.min, 1900);
eq('target.max', req.target_kcal.max, 2150);
eq('protein', req.protein_g, 158); // 75 * 2.1
eq('fats', req.fats_g, 68); // 75 * 0.9

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
