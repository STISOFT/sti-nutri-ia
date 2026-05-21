// ============================================================
// CALCULADORA — Método - Pérdida de Grasa (Bloque 5)
//
// Convierte el peso del usuario + las variables del Bloque 4
// (nivel de actividad, recuperación, inflamación, tipo de cuerpo)
// en requerimientos energéticos y de macronutrientes.
//
// Todas las funciones son puras. Las cantidades calóricas se
// expresan como rangos (min/max) porque el cálculo no es rígido
// según el principio del bloque ("se basa en parámetros + contexto").
// Los macros se calculan como valor único redondeado a entero.
// ============================================================

import type {
  ActivityLevel,
  BodyType,
  DeficitType,
  InflammationLevel,
  LevelLMH,
  Requirements,
} from '@/types/method';

// ───── 1 · Calorías de mantenimiento ────────────────────────
// Fórmula: kcal = peso × factor(nivel_actividad)
//   Sedentario → 28–30 kcal/kg
//   Bajo       → 30–32 kcal/kg
//   Moderado   → 32–34 kcal/kg
//   Alto       → 34–36 kcal/kg
export function calculateMaintenanceKcal(
  weight_kg: number,
  activity: ActivityLevel
): { min: number; max: number } {
  const factors: Record<ActivityLevel, { min: number; max: number }> = {
    sedentario: { min: 28, max: 30 },
    bajo: { min: 30, max: 32 },
    moderado: { min: 32, max: 34 },
    alto: { min: 34, max: 36 },
  };
  const f = factors[activity];
  return {
    min: Math.round(weight_kg * f.min),
    max: Math.round(weight_kg * f.max),
  };
}

// ───── 2 · Selección de déficit (conservador / moderado) ────
// Conservador (-300 kcal) cuando hay al menos un factor limitante:
//   recuperación = baja  O
//   inflamación  = alta  O
//   nivel        = bajo o sedentario
// Moderado (-400 a -500 kcal) si las 3 condiciones favorables se cumplen:
//   recuperación ≥ media  Y
//   inflamación  ≠ alta   Y
//   nivel        ≥ moderado
export function selectDeficitType(profile: {
  recovery: LevelLMH;
  inflammation: InflammationLevel;
  activity_level: ActivityLevel;
}): DeficitType {
  const recoveryLow = profile.recovery === 'baja';
  const inflammationHigh = profile.inflammation === 'alta';
  const lowActivity =
    profile.activity_level === 'sedentario' || profile.activity_level === 'bajo';

  if (recoveryLow || inflammationHigh || lowActivity) return 'conservador';
  return 'moderado';
}

// ───── 3 · Calorías objetivo (target) ───────────────────────
// Conservador: maintenance - 300 (uniforme).
// Moderado:    -500 al min y -400 al max (preserva rango).
export function calculateTargetKcal(
  maintenance: { min: number; max: number },
  deficit: DeficitType
): { min: number; max: number } {
  if (deficit === 'conservador') {
    return { min: maintenance.min - 300, max: maintenance.max - 300 };
  }
  // moderado
  return { min: maintenance.min - 500, max: maintenance.max - 400 };
}

// ───── 4 · Proteína ─────────────────────────────────────────
// Regla base 1.8–2.2 g/kg, con ajuste por tipo de cuerpo:
//   gordiflaco (baja_masa_grasa_localizada) → 2.1 (rango 2.0–2.2)
//   delgado                                 → 1.9 (rango 1.8–2.0)
//   acumulador_grasa (complexión ancha)     → 2.0
export function calculateProteinGrams(
  weight_kg: number,
  body_type: BodyType
): number {
  const perKg: Record<BodyType, number> = {
    baja_masa_grasa_localizada: 2.1,
    delgado: 1.9,
    acumulador_grasa: 2.0,
  };
  return Math.round(weight_kg * perKg[body_type]);
}

// ───── 5 · Grasas ───────────────────────────────────────────
// Regla base 0.8–1 g/kg.
//   Inflamación alta → mantener en rango alto (0.95)
//   Otros            → punto medio (0.9)
export function calculateFatsGrams(
  weight_kg: number,
  inflammation: InflammationLevel
): number {
  const perKg = inflammation === 'alta' ? 0.95 : 0.9;
  return Math.round(weight_kg * perKg);
}

// ───── 6 · Carbohidratos ────────────────────────────────────
// Calorías restantes después de proteína (4 kcal/g) y grasas (9 kcal/g).
// Se usa el promedio del rango de target_kcal para producir un valor único.
//   1g carb = 4 kcal
//   Resultado se piso-corta a 0 para evitar negativos.
export function calculateCarbsGrams(args: {
  target_kcal: { min: number; max: number };
  protein_g: number;
  fats_g: number;
}): number {
  const avgKcal = (args.target_kcal.min + args.target_kcal.max) / 2;
  const proteinKcal = args.protein_g * 4;
  const fatsKcal = args.fats_g * 9;
  const carbsKcal = avgKcal - proteinKcal - fatsKcal;
  return Math.max(0, Math.round(carbsKcal / 4));
}

// ───── Orquestador ─────────────────────────────────────────
// Recibe peso + las variables clasificadas relevantes del Bloque 4 y
// devuelve Requirements completo (Bloque 5).
export function calculateRequirements(args: {
  weight_kg: number;
  body_type: BodyType;
  activity_level: ActivityLevel;
  inflammation: InflammationLevel;
  recovery: LevelLMH;
}): Requirements {
  const maintenance = calculateMaintenanceKcal(args.weight_kg, args.activity_level);
  const deficitType = selectDeficitType({
    recovery: args.recovery,
    inflammation: args.inflammation,
    activity_level: args.activity_level,
  });
  const target = calculateTargetKcal(maintenance, deficitType);
  const protein = calculateProteinGrams(args.weight_kg, args.body_type);
  const fats = calculateFatsGrams(args.weight_kg, args.inflammation);
  const carbs = calculateCarbsGrams({
    target_kcal: target,
    protein_g: protein,
    fats_g: fats,
  });

  return {
    maintenance_kcal: maintenance,
    target_kcal: target,
    deficit_type: deficitType,
    protein_g: protein,
    fats_g: fats,
    carbs_g: carbs,
  };
}
