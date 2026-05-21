import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { quizAnswersSchema } from '@/lib/validations/method';

// POST /api/onboarding/assessment
// Recibe las 15 respuestas del Bloque 3 y las guarda en client_assessments.
// Usa upsert por user_id para permitir que el usuario re-evalúe.
export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // ── Validación ───────────────────────────────────────────────
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const parsed = quizAnswersSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const a = parsed.data;

  // Normaliza horarios vacíos a null (en el form se enviaban como '')
  const norm = (v: string | undefined | null) => (v && v.trim() ? v : null);

  // ── Persistencia ─────────────────────────────────────────────
  try {
    const record = await prisma.clientAssessment.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        q1_goal: a.q1_goal,
        q2_body_description: a.q2_body_description,
        q3_training_frequency: a.q3_training_frequency,
        q4_main_difficulty: a.q4_main_difficulty,
        q5_meals_per_day: a.q5_meals_per_day,
        q6_inflammation_perception: a.q6_inflammation_perception,
        age: a.age,
        weight_kg: a.weight_kg,
        height_cm: a.height_cm,
        waist_cm: a.waist_cm ?? null,
        wake_time: norm(a.wake_time),
        work_time: norm(a.work_time),
        train_time: norm(a.train_time),
        sleep_time: norm(a.sleep_time),
        q9_training_type: a.q9_training_type,
        q10_food_quality: a.q10_food_quality,
        q10_typical_day: norm(a.q10_typical_day),
        q11_digestion_symptoms: a.q11_digestion_symptoms,
        q12_post_meal_sensation: a.q12_post_meal_sensation,
        q13_sleep_hours: a.q13_sleep_hours,
        q14_stress_level: a.q14_stress_level,
        q15_food_restrictions: norm(a.q15_food_restrictions),
      },
      update: {
        q1_goal: a.q1_goal,
        q2_body_description: a.q2_body_description,
        q3_training_frequency: a.q3_training_frequency,
        q4_main_difficulty: a.q4_main_difficulty,
        q5_meals_per_day: a.q5_meals_per_day,
        q6_inflammation_perception: a.q6_inflammation_perception,
        age: a.age,
        weight_kg: a.weight_kg,
        height_cm: a.height_cm,
        waist_cm: a.waist_cm ?? null,
        wake_time: norm(a.wake_time),
        work_time: norm(a.work_time),
        train_time: norm(a.train_time),
        sleep_time: norm(a.sleep_time),
        q9_training_type: a.q9_training_type,
        q10_food_quality: a.q10_food_quality,
        q10_typical_day: norm(a.q10_typical_day),
        q11_digestion_symptoms: a.q11_digestion_symptoms,
        q12_post_meal_sensation: a.q12_post_meal_sensation,
        q13_sleep_hours: a.q13_sleep_hours,
        q14_stress_level: a.q14_stress_level,
        q15_food_restrictions: norm(a.q15_food_restrictions),
        // Resetear los campos clasificados/calculados — se vuelven a generar en Fase 3-5
        classified_body_type: null,
        classified_activity_level: null,
        classified_inflammation: null,
        classified_difficulty: null,
        classified_meal_structure: null,
        classified_life_structure: null,
        classified_food_quality: null,
        classified_digestive_alert: null,
        classified_recovery: null,
        classified_abdominal_fat: null,
        calc_maintenance_kcal_min: null,
        calc_maintenance_kcal_max: null,
        calc_target_kcal_min: null,
        calc_target_kcal_max: null,
        calc_deficit_type: null,
        calc_protein_g: null,
        calc_fats_g: null,
        calc_carbs_g: null,
      },
      select: { id: true, created_at: true, updated_at: true },
    });

    return NextResponse.json(
      { ok: true, id: record.id, updated_at: record.updated_at },
      { status: 201 }
    );
  } catch (err) {
    console.error('[onboarding/assessment] Error al persistir:', err);
    return NextResponse.json(
      { error: 'No pudimos guardar tu evaluación. Inténtalo más tarde.' },
      { status: 500 }
    );
  }
}
