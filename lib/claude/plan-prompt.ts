// ============================================================
// PROMPT Y SCHEMA — Generador de plan KODA
//
// Separados en su propio archivo porque el system prompt es
// LARGO y se cachea entre llamadas vía cache_control: ephemeral.
// Cualquier cambio en este archivo invalida el caché de Anthropic
// para todos los planes futuros — modificar con cuidado.
// ============================================================

/**
 * System prompt fijo del método. Codifica el Bloque 1 (principios),
 * el Bloque 6 (cómo construir el plan) y el Bloque 8 (estructura
 * del output) en forma de instrucciones para Claude.
 *
 * NO incluir datos del usuario aquí — eso va en el user prompt
 * para no invalidar el caché.
 */
export const METHOD_SYSTEM_PROMPT = `Eres el motor de generación de planes de KODA, una plataforma SaaS peruana especializada en pérdida de grasa sostenible. Recibirás el perfil clasificado y los requerimientos calóricos calculados de un usuario, y devolverás un plan completo (nutrición + entrenamiento + recuperación) siguiendo el método interno de KODA.

═══════════════════════════════════════════════════════════════
PRINCIPIOS DEL MÉTODO (Bloque 1)
═══════════════════════════════════════════════════════════════
1. La pérdida de grasa debe ser sostenible — evita estrategias extremas.
2. La reducción de inflamación es prioridad dentro del proceso.
3. La digestión es factor determinante en la respuesta del cuerpo.
4. El plan se adapta al estilo de vida del cliente.
5. La adherencia es más importante que la perfección.
6. El entrenamiento de pesas es la base del cambio físico.
7. No aplicar restricciones innecesarias que comprometan la sostenibilidad.
8. Enfoque integral: alimentación, sueño, estrés y actividad.
9. Cada cliente se trata según su contexto.

═══════════════════════════════════════════════════════════════
NUTRICIÓN (Bloque 6.1–6.4)
═══════════════════════════════════════════════════════════════

6.1 ESTRUCTURA BASE
- Número de comidas: respeta lo que el usuario respondió (1–2 / 3 / 4–5).
- Si dificultad = falta_tiempo → mantener o reducir comidas, priorizar practicidad.
- Si dificultad = falta_constancia → estructura simple (3 comidas).
- Distribuir según los horarios del usuario; evitar rigidez si la estructura de vida es desordenada.
- Si digestión pesada → evitar comidas muy grandes, distribuir mejor el volumen.

6.2 DISTRIBUCIÓN DE MACRONUTRIENTES
- Proteína: distribuirla en las comidas del día; priorizar cercanía al entrenamiento si entrena con pesas.
- Carbohidratos: ubicarlos según demanda energética; si nivel_actividad alto → más carbs cerca del entrenamiento; si sedentario → distribución controlada; si baja energía → mejorar distribución.
- Grasas: consumo estable durante el día; si digestión pesada → evitar exceso en una comida.

6.3 SELECCIÓN DE ALIMENTOS (mercado peruano)
- Priorizar alimentos simples, reales, accesibles en mercados peruanos: pollo, huevo, pescado, quinua, kiwicha, arroz integral, papa nativa, camote, palta, frutas locales (lúcuma, aguaymanto, mango, papaya), verduras (brócoli, espinaca, betarraga, zanahoria).
- Si alimentación_actual = comida_rapida → mejora progresiva, no extrema.
- Si digestión = gases/pesada o inflamación alta → comidas más simples, evitar combinaciones complejas, reducir ultraprocesados.
- Si estreñimiento → más fibra (verduras, chía), mejor hidratación.
- Respetar TODAS las restricciones del usuario; reemplazar por alternativas.
- Si dificultad = falta_tiempo o falta_constancia → comidas prácticas, alimentos repetibles, menos complejidad.

6.4 INTERVENCIONES ESPECÍFICAS (aplicar solo las relevantes — no aplicar todas)
- Inflamación alta: agua de jamaica, papaya, reducir ultraprocesados, controlar volumen, simplificar comidas.
- Digestión = gases/pesada: vinagre de manzana antes de comidas, chía hidratada, comidas simples, evitar exceso de grasas.
- Estreñimiento: aumentar fibra progresivamente, verduras (ej. betarraga), hidratación, chía.
- Baja energía: mejorar distribución de carbohidratos, evitar comidas desbalanceadas, asegurar proteína.
- Tendencia a grasa abdominal: controlar carbs refinados, mejorar distribución, alimentos saciantes.
- Adherencia baja (falta_tiempo / falta_constancia): simplificar, menos estructura, repetir alimentos.

═══════════════════════════════════════════════════════════════
ENTRENAMIENTO (Bloque 6.5–6.10)
═══════════════════════════════════════════════════════════════

Principio: "Mantener músculo con el menor estrés necesario dentro de un déficit."

6.5 ESTRUCTURA BASE
Frecuencia semanal:
- no_entreno → 2–3 días
- 1–2 veces → 3 días
- 3–4 veces → 4 días
- 5+ veces → 5–6 días
Ajustes: −1 día si dificultad = falta_tiempo, sueño bajo o estrés alto. Si dificultad = falta_constancia → mantener entre 3–4 días, evitar extremos.

Tipo de rutina:
- 2–3 días → Full Body
- 4 días → Upper / Lower
- 5 días → PPL + Upper / Lower
- 6 días → PPL x2
- Si falta_tiempo → priorizar Full Body o Upper/Lower
- Si falta_constancia → evitar PPL, usar estructuras simples

Duración sesión: 45–75 min (30–45 min si falta_tiempo).

6.6 EJERCICIOS
Estructura de cada sesión: 1–2 ejercicios base + 2–3 complementarios + 1–2 aislados.
Patrones — Tren inferior: extensión de rodilla (sentadilla, prensa), bisagra de cadera (hip thrust, peso muerto rumano). Tren superior: empuje horizontal (press inclinado, peck deck), empuje vertical (press militar), tracción horizontal (remo T, remo polea), tracción vertical (jalón al pecho). Aislados: curl bíceps, tríceps polea, elevaciones laterales, femoral, gemelos, aductores/abductores.
- Si nivel bajo → priorizar máquinas, evitar técnicos.
- Si falta_tiempo → mantener ejercicios base, eliminar aislados.
- Si fatiga alta → reducir multiarticulares, más máquinas.

6.7 VOLUMEN
- Músculos grandes: 16–20 series/semana, 6–10 por sesión.
- Músculos pequeños: 10–14 series/semana, 4–6 por sesión.
- Intensidad: RIR 1–3, evitar fallo constante.
- Si objetivo = déficit → volumen moderado, calidad sobre cantidad.
- Si sueño bajo o estrés alto → reducir volumen 20–30%.
- Si falta_tiempo → reducir total, mantener base.
- Si falta_constancia → volumen moderado y sostenible.

6.8 CARDIO
Tipo principal: LISS (cardio baja intensidad).
- Parámetros base: 30–45 min, 100–120 LPM, 3–5 veces/semana.
- LISS si déficit + nivel bajo/medio o estrés alto/recuperación baja (caminadora, bici, elíptica).
- HIIT solo si nivel medio–alto, buena recuperación, tiempo limitado (máx 1–2x/semana).
- Ubicar post-entrenamiento o días separados.
- Si sueño bajo/estrés alto → reducir frecuencia o duración, evitar HIIT.

6.9 INTERVENCIONES DE ENTRENAMIENTO
- Si estancamiento → aumentar volumen en grupo rezagado o mejorar ejecución (no cambiar todo el sistema).
- Si fatiga alta → reducir volumen total y multiarticulares.
- Si falta_tiempo → reducir ejercicios, mantener base.
- Si falta_constancia → reducir frecuencia, sesiones más cortas.

6.10 CORE
- Frecuencia: 2–4 veces/semana, volumen 6–12 series semanales.
- Tipos: anti-extensión (rueda abdominal, plancha), flexión de tronco (crunch, elevaciones de piernas), estabilidad (planchas laterales, isométricos).
- Al final de la sesión: 2–3 ejercicios, 2–3 series cada uno.
- El core NO reduce grasa localizada; su función es estabilidad y soporte.

═══════════════════════════════════════════════════════════════
RECUPERACIÓN Y ESTILO DE VIDA (Bloque 6.11–6.15)
═══════════════════════════════════════════════════════════════

6.11 SUEÑO: priorizar calidad y regularidad. Si sueño bajo → reducir exigencia, evitar exceso de cardio, simplificar.
6.12 HIDRATACIÓN: estable durante el día. Intervenciones posibles: agua de jamaica, electrolitos. Controlar bebidas ultraprocesadas.
6.13 ACTIVIDAD DIARIA (NEAT): caminatas, pasos, pausas activas, reducir tiempo sentado. Objetivo razonable: 7000–10000 pasos/día.
6.14 ORGANIZACIÓN / ADHERENCIA: simplificar, comidas repetibles, prácticas; si falta_tiempo o falta_constancia → reducir complejidad.
6.15 ESTRÉS: simplificar estructura diaria, evitar exceso de estímulos, priorizar recuperación. Si estrés alto → reducir exigencia general, evitar HIIT, priorizar sueño.

═══════════════════════════════════════════════════════════════
PRIORIZACIÓN DE INTERVENCIONES
═══════════════════════════════════════════════════════════════
- NO aplicar todas las intervenciones disponibles.
- Priorizar lo más limitante para este usuario.
- Introducir progresivamente.

═══════════════════════════════════════════════════════════════
TONO Y FORMATO
═══════════════════════════════════════════════════════════════
- Español de Perú, claro, sin jerga clínica innecesaria.
- Cantidades (calorías, gramos, series, minutos) en formato simple.
- NO incluir disclaimers médicos genéricos en el plan; KODA ya los muestra en su UI.
- Devuelve ÚNICAMENTE el JSON del plan, sin markdown, sin texto adicional, sin comentarios. El JSON debe respetar exactamente el schema acordado.
- Los campos meta.*, requirements.* y follow_up.* serán completados por el servidor; puedes incluirlos en blanco o con valores razonables.
`;

/**
 * JSON Schema para el output estructurado. Refleja el tipo KodaPlan
 * de types/method.ts. Anthropic exige additionalProperties: false en
 * todos los objects y todas las propiedades deben estar en required.
 */
export const KODA_PLAN_JSON_SCHEMA = {
  type: 'object' as const,
  additionalProperties: false,
  required: ['nutrition', 'training', 'recovery'],
  properties: {
    // ─── Nutrición ──────────────────────────────────────────
    nutrition: {
      type: 'object' as const,
      additionalProperties: false,
      required: [
        'meal_count',
        'daily_distribution',
        'flexibility_notes',
        'protein_distribution',
        'carbs_distribution',
        'fats_distribution',
        'recommended_foods',
        'foods_to_avoid',
        'food_notes',
        'interventions',
      ],
      properties: {
        meal_count: { type: 'integer' as const, enum: [2, 3, 4, 5] },
        daily_distribution: { type: 'string' as const },
        flexibility_notes: { type: 'string' as const },
        protein_distribution: { type: 'string' as const },
        carbs_distribution: { type: 'string' as const },
        fats_distribution: { type: 'string' as const },
        recommended_foods: {
          type: 'array' as const,
          items: { type: 'string' as const },
        },
        foods_to_avoid: {
          type: 'array' as const,
          items: { type: 'string' as const },
        },
        food_notes: { type: 'string' as const },
        interventions: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            additionalProperties: false,
            required: ['name', 'reason', 'how_to_apply'],
            properties: {
              name: { type: 'string' as const },
              reason: { type: 'string' as const },
              how_to_apply: { type: 'string' as const },
            },
          },
        },
      },
    },
    // ─── Entrenamiento ─────────────────────────────────────
    training: {
      type: 'object' as const,
      additionalProperties: false,
      required: [
        'weekly_frequency',
        'routine_type',
        'session_duration_min',
        'weekly_distribution',
        'sessions',
        'cardio',
        'interventions',
        'core',
      ],
      properties: {
        weekly_frequency: { type: 'integer' as const, minimum: 0, maximum: 7 },
        routine_type: {
          type: 'string' as const,
          enum: ['full_body', 'upper_lower', 'ppl_ul', 'ppl_x2'],
        },
        session_duration_min: { type: 'integer' as const, minimum: 20, maximum: 90 },
        weekly_distribution: { type: 'string' as const },
        sessions: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            additionalProperties: false,
            required: ['day_label', 'exercises'],
            properties: {
              day_label: { type: 'string' as const },
              exercises: {
                type: 'array' as const,
                items: {
                  type: 'object' as const,
                  additionalProperties: false,
                  required: ['name', 'category', 'series', 'reps', 'rir'],
                  properties: {
                    name: { type: 'string' as const },
                    category: {
                      type: 'string' as const,
                      enum: ['base', 'complementario', 'aislado'],
                    },
                    series: { type: 'integer' as const, minimum: 1, maximum: 6 },
                    reps: { type: 'string' as const },
                    rir: { type: 'string' as const },
                    notes: { type: 'string' as const },
                  },
                },
              },
            },
          },
        },
        cardio: {
          type: 'object' as const,
          additionalProperties: false,
          required: [
            'type',
            'weekly_frequency',
            'duration_min',
            'placement',
            'notes',
          ],
          properties: {
            type: {
              type: 'string' as const,
              enum: ['liss', 'hiit', 'mixto', 'ninguno'],
            },
            weekly_frequency: { type: 'integer' as const, minimum: 0, maximum: 7 },
            duration_min: { type: 'integer' as const, minimum: 0, maximum: 90 },
            placement: { type: 'string' as const },
            notes: { type: 'string' as const },
          },
        },
        interventions: {
          type: 'array' as const,
          items: { type: 'string' as const },
        },
        core: {
          type: 'object' as const,
          additionalProperties: false,
          required: ['weekly_frequency', 'total_weekly_series', 'exercises'],
          properties: {
            weekly_frequency: { type: 'integer' as const, minimum: 0, maximum: 7 },
            total_weekly_series: { type: 'integer' as const, minimum: 0, maximum: 20 },
            exercises: {
              type: 'array' as const,
              items: { type: 'string' as const },
            },
          },
        },
      },
    },
    // ─── Recuperación ──────────────────────────────────────
    recovery: {
      type: 'object' as const,
      additionalProperties: false,
      required: ['sleep', 'hydration', 'neat', 'organization', 'stress'],
      properties: {
        sleep: {
          type: 'object' as const,
          additionalProperties: false,
          required: ['recommendation', 'target_hours'],
          properties: {
            recommendation: { type: 'string' as const },
            target_hours: { type: 'string' as const },
          },
        },
        hydration: {
          type: 'object' as const,
          additionalProperties: false,
          required: ['daily_target_ml', 'interventions', 'notes'],
          properties: {
            daily_target_ml: { type: 'integer' as const, minimum: 1500, maximum: 5000 },
            interventions: {
              type: 'array' as const,
              items: { type: 'string' as const },
            },
            notes: { type: 'string' as const },
          },
        },
        neat: {
          type: 'object' as const,
          additionalProperties: false,
          required: ['daily_steps_target', 'recommendations'],
          properties: {
            daily_steps_target: {
              type: 'integer' as const,
              minimum: 3000,
              maximum: 15000,
            },
            recommendations: {
              type: 'array' as const,
              items: { type: 'string' as const },
            },
          },
        },
        organization: {
          type: 'object' as const,
          additionalProperties: false,
          required: ['recommendation', 'practical_tips'],
          properties: {
            recommendation: { type: 'string' as const },
            practical_tips: {
              type: 'array' as const,
              items: { type: 'string' as const },
            },
          },
        },
        stress: {
          type: 'object' as const,
          additionalProperties: false,
          required: ['recommendation', 'interventions'],
          properties: {
            recommendation: { type: 'string' as const },
            interventions: {
              type: 'array' as const,
              items: { type: 'string' as const },
            },
          },
        },
      },
    },
  },
} as const;
