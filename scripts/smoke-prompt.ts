/**
 * Smoke test del prompt builder. NO llama a Claude — solo imprime
 * el system prompt completo y un ejemplo de user prompt para que
 * podamos auditar el contenido manualmente.
 *
 * Corre con: `npx tsx scripts/smoke-prompt.ts`
 */
import { buildUserPrompt } from '../lib/claude/plan-generator';
import { METHOD_SYSTEM_PROMPT, KODA_PLAN_JSON_SCHEMA } from '../lib/claude/plan-prompt';

const sampleInput = {
  classified: {
    body_type: 'baja_masa_grasa_localizada' as const,
    activity_level: 'moderado' as const,
    inflammation: 'moderada' as const,
    difficulty: 'falta_tiempo' as const,
    meal_structure: 'media' as const,
    life_structure: 'estructurada' as const,
    food_quality: 'media' as const,
    digestive_alert: 'baja' as const,
    recovery: 'alta' as const,
    abdominal_fat: 'alta' as const,
    food_restrictions: 'lactosa',
  },
  requirements: {
    maintenance_kcal: { min: 2400, max: 2550 },
    target_kcal: { min: 1900, max: 2150 },
    deficit_type: 'moderado' as const,
    protein_g: 158,
    fats_g: 68,
    carbs_g: 203,
  },
  plan_tier: 'core' as const,
  full_name: 'Juan Pérez',
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('SYSTEM PROMPT — primeras 800 chars (cacheable)');
console.log('═══════════════════════════════════════════════════════════════');
console.log(METHOD_SYSTEM_PROMPT.slice(0, 800));
console.log('... (total: ' + METHOD_SYSTEM_PROMPT.length + ' caracteres)');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('USER PROMPT (variable, NO cacheable)');
console.log('═══════════════════════════════════════════════════════════════');
console.log(buildUserPrompt(sampleInput));
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('JSON SCHEMA — top-level keys');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Required:', KODA_PLAN_JSON_SCHEMA.required);
console.log('Properties:', Object.keys(KODA_PLAN_JSON_SCHEMA.properties));
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ Prompt construido correctamente.');
console.log('   • Tokens estimados system:', Math.round(METHOD_SYSTEM_PROMPT.length / 4));
console.log('   • Tokens estimados user:  ', Math.round(buildUserPrompt(sampleInput).length / 4));
console.log('═══════════════════════════════════════════════════════════════');
