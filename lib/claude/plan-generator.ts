// ============================================================
// PLAN GENERATOR — Método - Pérdida de Grasa (Bloque 6 + 8)
//
// Recibe el perfil clasificado (Bloque 4) + los requerimientos
// calculados (Bloque 5) y delega en Claude la generación del
// plan completo: nutrición + entrenamiento + recuperación.
//
// Optimizaciones aplicadas:
//   • Modelo: claude-sonnet-4-6 (balance speed / calidad para
//     generación estructurada con razonamiento moderado).
//   • Adaptive thinking + effort: high (calidad de plan importa).
//   • Prompt caching: el system prompt (reglas del método) es
//     constante entre usuarios → cache_control ephemeral.
//   • Structured outputs vía output_config.format con JSON schema
//     que matchea el tipo KodaPlan.
//   • Streaming porque max_tokens elevado (~16000+).
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import type {
  ClassifiedProfile,
  KodaPlan,
  Requirements,
} from '@/types/method';
import { METHOD_SYSTEM_PROMPT, KODA_PLAN_JSON_SCHEMA } from './plan-prompt';

const MODEL = 'claude-sonnet-4-6';
const METHOD_VERSION = 'perdida-grasa-v4';
const MAX_TOKENS = 16000;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurado');
  return new Anthropic({ apiKey });
}

export interface GeneratePlanInput {
  classified: ClassifiedProfile;
  requirements: Requirements;
  /** Tier del plan adquirido por el usuario — determina seguimiento (Bloque 2). */
  plan_tier: 'inicio' | 'core' | 'pro';
  /** Nombre del usuario para personalizar el tono (opcional). */
  full_name?: string;
}

export interface GeneratePlanResult {
  plan: KodaPlan;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
  };
}

/**
 * Genera un KodaPlan completo a partir del perfil clasificado y los
 * requerimientos. Streamea internamente para evitar timeouts cuando
 * el thinking de adaptive piensa por más de unos segundos.
 */
export async function generateKodaPlan(
  input: GeneratePlanInput
): Promise<GeneratePlanResult> {
  const client = getClient();

  const userPrompt = buildUserPrompt(input);

  // Stream para evitar HTTP timeout y para tener mejor UX en
  // el endpoint si más adelante decidimos exponer SSE al cliente.
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: {
        type: 'json_schema',
        schema: KODA_PLAN_JSON_SCHEMA,
      },
    },
    // System en formato array para poder marcar cache_control en
    // el bloque grande del método. Esto cachea el prompt del método
    // entre llamadas (mismo método = misma cache key).
    system: [
      {
        type: 'text',
        text: METHOD_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const message = await stream.finalMessage();

  // Extraer el JSON del bloque de texto. Como pedimos output_config
  // estructurado, el contenido debería ser un único bloque text con
  // JSON parseable directamente.
  const textBlock = message.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text'
  );
  if (!textBlock) {
    throw new Error('Respuesta de Claude sin bloque de texto');
  }

  let plan: KodaPlan;
  try {
    plan = JSON.parse(textBlock.text) as KodaPlan;
  } catch {
    console.error('[plan-generator] JSON inválido:', textBlock.text.slice(0, 500));
    throw new Error('Claude devolvió JSON no parseable');
  }

  // Completar/asegurar metadata que controlamos del lado servidor
  plan.meta = {
    method_version: METHOD_VERSION,
    generated_at: new Date().toISOString(),
    plan_tier: input.plan_tier,
  };
  plan.requirements = input.requirements;
  plan.follow_up = followUpForTier(input.plan_tier);

  return {
    plan,
    usage: {
      input_tokens: message.usage.input_tokens ?? 0,
      output_tokens: message.usage.output_tokens ?? 0,
      cache_creation_input_tokens: message.usage.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: message.usage.cache_read_input_tokens ?? 0,
    },
  };
}

/** Frecuencia de seguimiento según el tier (Bloque 2 del PDF). */
function followUpForTier(tier: 'inicio' | 'core' | 'pro'): KodaPlan['follow_up'] {
  switch (tier) {
    case 'inicio':
      return { frequency: 'sin_seguimiento' };
    case 'core':
      return { frequency: 'quincenal' };
    case 'pro':
      return { frequency: 'semanal' };
  }
}

/**
 * Construye el bloque user con los datos específicos del paciente.
 * El system prompt ya contiene las reglas del método, así que acá
 * solo va lo variable (lo que invalidaría el caché en otro caso).
 */
export function buildUserPrompt(input: GeneratePlanInput): string {
  const { classified, requirements, plan_tier, full_name } = input;
  const name = full_name?.trim() || 'el usuario';

  return [
    `Genera el plan completo para ${name}.`,
    '',
    'PERFIL CLASIFICADO (Bloque 4):',
    `- Tipo de cuerpo: ${classified.body_type}`,
    `- Nivel de actividad: ${classified.activity_level}`,
    `- Inflamación: ${classified.inflammation}`,
    `- Dificultad principal: ${classified.difficulty}`,
    `- Estructura de comidas: ${classified.meal_structure}`,
    `- Estructura de vida: ${classified.life_structure}`,
    `- Calidad de alimentación: ${classified.food_quality}`,
    `- Alerta digestiva: ${classified.digestive_alert}`,
    `- Recuperación: ${classified.recovery}`,
    `- Grasa abdominal: ${classified.abdominal_fat}`,
    `- Restricciones alimentarias: ${classified.food_restrictions || 'ninguna'}`,
    '',
    'REQUERIMIENTOS CALCULADOS (Bloque 5):',
    `- Mantenimiento kcal: ${requirements.maintenance_kcal.min}–${requirements.maintenance_kcal.max}`,
    `- Target kcal: ${requirements.target_kcal.min}–${requirements.target_kcal.max}`,
    `- Tipo de déficit: ${requirements.deficit_type}`,
    `- Proteína: ${requirements.protein_g} g`,
    `- Grasas: ${requirements.fats_g} g`,
    `- Carbohidratos: ${requirements.carbs_g} g`,
    '',
    `TIER DEL PLAN ADQUIRIDO: ${plan_tier.toUpperCase()}`,
    '',
    'Devuelve ÚNICAMENTE el JSON del plan (sin comentarios, sin markdown).',
  ].join('\n');
}
