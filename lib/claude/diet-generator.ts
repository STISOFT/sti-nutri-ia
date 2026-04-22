import Anthropic from '@anthropic-ai/sdk';
import type { HealthProfileInput } from '@/lib/validations/health-profile';
import type { DietPlanData } from '@/types/database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Helpers ───────────────────────────────────────────────────

function calcularBMI(weight_kg: number, height_cm: number): number {
  const h = height_cm / 100;
  return Math.round((weight_kg / (h * h)) * 10) / 10;
}

function describeBMI(bmi: number): string {
  if (bmi < 18.5) return 'bajo peso';
  if (bmi < 25) return 'peso normal';
  if (bmi < 30) return 'sobrepeso';
  return 'obesidad';
}

const GOAL_LABELS: Record<string, string> = {
  perder_peso: 'perder peso',
  ganar_peso: 'ganar peso',
  mantener_peso: 'mantener el peso actual',
  ganar_musculo: 'ganar músculo y definición',
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentario: 'sedentario (poco o ningún ejercicio)',
  ligero: 'actividad ligera (1-3 días/semana)',
  moderado: 'actividad moderada (3-5 días/semana)',
  activo: 'activo (6-7 días/semana)',
  muy_activo: 'muy activo (ejercicio intenso diario o trabajo físico)',
};

function buildPrompt(p: HealthProfileInput): string {
  const bmi = calcularBMI(p.weight_kg, p.height_cm);
  const preferidos = p.preferred_foods.length > 0 ? p.preferred_foods.join(', ') : 'ninguno especificado';
  const evitados = p.avoided_foods.length > 0 ? p.avoided_foods.join(', ') : 'ninguno';
  const alergias = p.food_allergies.length > 0 ? p.food_allergies.join(', ') : 'ninguna';
  const condiciones = p.medical_conditions?.trim() || 'ninguna';

  return `Eres un nutricionista clínico experto en cocina peruana y latinoamericana. Genera un plan de alimentación personalizado de 4 semanas (28 días) para el siguiente paciente.

PERFIL DEL PACIENTE:
- Edad: ${p.age} años
- Peso: ${p.weight_kg} kg | Estatura: ${p.height_cm} cm | IMC: ${bmi} (${describeBMI(bmi)})
- Objetivo principal: ${GOAL_LABELS[p.goal]}
- Nivel de actividad: ${ACTIVITY_LABELS[p.activity_level]}
- Alimentos preferidos: ${preferidos}
- Alimentos a evitar: ${evitados}
- Alergias alimentarias: ${alergias}
- Condiciones médicas: ${condiciones}

REGLAS OBLIGATORIAS:
1. NUNCA incluyas alimentos marcados como "a evitar" ni los que generan alergia
2. Prioriza ingredientes peruanos: quinua, kiwicha, lúcuma, camu camu, ají amarillo, rocoto, papa nativa, camote, yuca, oca, maíz morado, chía, maca, aguaymanto, etc.
3. Incluye platos peruanos adaptados: ceviche, lomo saltado, ají de gallina, sopa criolla, causa, olluco, estofado, etc.
4. Cada semana debe tener un tema motivador diferente
5. Varía las recetas — no repitas la misma comida más de 2 veces por semana
6. Las calorías deben ser coherentes con el objetivo y nivel de actividad
7. Los consejos diarios deben ser prácticos y motivadores

FORMATO DE RESPUESTA:
Responde ÚNICAMENTE con JSON válido, sin texto adicional ni code fences. Usa exactamente esta estructura:

{
  "summary": {
    "calories_per_day": 1800,
    "protein_g": 120,
    "carbs_g": 200,
    "fat_g": 60,
    "water_ml": 2500,
    "notes": "Resumen del plan en 2-3 oraciones explicando el enfoque nutricional."
  },
  "weeks": [
    {
      "week_number": 1,
      "theme": "Semana de arranque: limpieza y energía",
      "days": [
        {
          "day": 1,
          "day_name": "Lunes",
          "meals": {
            "desayuno": {
              "name": "Avena con quinua y frutas",
              "description": "Bowl energizante con avena integral, quinua cocida y fruta fresca de temporada.",
              "calories": 320,
              "ingredients": ["avena integral", "quinua cocida", "plátano", "miel de abeja"],
              "prep_time_min": 10
            },
            "media_manana": {
              "name": "Yogur con aguaymanto",
              "description": "Yogur natural con frutas antioxidantes.",
              "calories": 150,
              "ingredients": ["yogur natural", "aguaymanto fresco"],
              "prep_time_min": 2
            },
            "almuerzo": {
              "name": "Arroz con pollo a la peruana",
              "description": "Clásico arroz con pollo preparado con ají amarillo, culantro y vegetales frescos.",
              "calories": 580,
              "ingredients": ["arroz integral", "pollo", "ají amarillo", "culantro", "arvejas", "zanahoria"],
              "prep_time_min": 35
            },
            "media_tarde": {
              "name": "Mazamorra morada light",
              "description": "Versión ligera del postre tradicional peruano.",
              "calories": 130,
              "ingredients": ["maíz morado", "piña", "membrillo", "canela"],
              "prep_time_min": 20
            },
            "cena": {
              "name": "Ensalada de quinua con verduras",
              "description": "Ensalada nutritiva con quinua cocida, pepino, tomate y aderezo de limón.",
              "calories": 280,
              "ingredients": ["quinua", "pepino", "tomate", "palta", "limón"],
              "prep_time_min": 15
            }
          },
          "total_calories": 1460,
          "daily_tip": "Comienza el día con un vaso de agua tibia con limón para activar tu metabolismo."
        }
      ],
      "shopping_list": [
        "avena integral 500g",
        "quinua 1kg",
        "pollo entero 1.5kg",
        "arroz integral 1kg",
        "verduras frescas variadas"
      ]
    }
  ]
}

Genera el plan completo para las 4 semanas (semanas 1, 2, 3 y 4) con los 7 días cada una.`;
}

// ── Función principal ─────────────────────────────────────────

export async function generateDietPlan(profile: HealthProfileInput): Promise<DietPlanData> {
  const attempt = async (): Promise<DietPlanData> => {
    // Usamos streaming para manejar la respuesta larga sin timeout
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: buildPrompt(profile),
        },
      ],
    });

    const message = await stream.finalMessage();

    // Extraer bloque de texto
    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Claude no devolvió texto en la respuesta');
    }

    // Limpiar posibles code fences
    const jsonText = textBlock.text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(jsonText) as DietPlanData;

    // Validación mínima de estructura
    if (!parsed.summary || !Array.isArray(parsed.weeks) || parsed.weeks.length === 0) {
      throw new Error('El plan generado tiene una estructura inválida');
    }

    return parsed;
  };

  // 1 intento + 1 retry si el parseo falla
  try {
    return await attempt();
  } catch (error) {
    console.error('[diet-generator] Primer intento falló, reintentando:', error);
    return await attempt();
  }
}
