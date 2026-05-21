import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { generateKodaPlan } from '@/lib/claude/plan-generator';
import { PLANS } from '@/types/database';
import type { PlanId } from '@/types/database';
import type {
  ClassifiedProfile,
  Requirements,
  ActivityLevel,
  BodyType,
  InflammationLevel,
  LevelLMH,
  LifeStructure,
  AbdominalFat,
  MainDifficulty,
  DeficitType,
} from '@/types/method';

// Streaming del SDK + adaptive thinking pueden tardar varios segundos;
// extendemos el timeout del runtime de Next.
export const maxDuration = 60;

/**
 * POST /api/plan/generate
 * Genera un KodaPlan completo (nutrición + entrenamiento + recuperación)
 * a partir del ClientAssessment del usuario autenticado.
 */
export async function POST(request: NextRequest) {
  void request; // body no se necesita; toda la info viene de DB

  // ── 1. Auth ──────────────────────────────────────────────────
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

  // ── 2. Suscripción activa ────────────────────────────────────
  const subscription = await prisma.subscription.findFirst({
    where: { user_id: user.id, status: 'active' },
  });
  if (!subscription) {
    return NextResponse.json(
      { error: 'Necesitas una suscripción activa para generar tu plan' },
      { status: 403 }
    );
  }

  // ── 3. ClientAssessment ──────────────────────────────────────
  const assessment = await prisma.clientAssessment.findUnique({
    where: { user_id: user.id },
  });
  if (!assessment) {
    return NextResponse.json(
      { error: 'Completa tu evaluación antes de generar un plan' },
      { status: 400 }
    );
  }

  // Reconstruir ClassifiedProfile y Requirements desde los campos
  // persistidos. Esto requiere que la Fase 3 + Fase 4 ya hayan
  // populado los campos classified_* y calc_*; si están en null,
  // pedimos al usuario re-enviar la evaluación.
  if (
    !assessment.classified_body_type ||
    !assessment.calc_target_kcal_min ||
    !assessment.calc_deficit_type
  ) {
    return NextResponse.json(
      {
        error:
          'Tu evaluación está incompleta. Vuelve a enviar el formulario para regenerarla.',
      },
      { status: 409 }
    );
  }

  const classified: ClassifiedProfile = {
    body_type: assessment.classified_body_type as BodyType,
    activity_level: assessment.classified_activity_level as ActivityLevel,
    inflammation: assessment.classified_inflammation as InflammationLevel,
    difficulty: assessment.classified_difficulty as MainDifficulty,
    meal_structure: assessment.classified_meal_structure as LevelLMH,
    life_structure: assessment.classified_life_structure as LifeStructure,
    food_quality: assessment.classified_food_quality as LevelLMH,
    digestive_alert: assessment.classified_digestive_alert as LevelLMH,
    recovery: assessment.classified_recovery as LevelLMH,
    abdominal_fat: assessment.classified_abdominal_fat as AbdominalFat,
    food_restrictions: assessment.q15_food_restrictions ?? '',
  };

  const requirements: Requirements = {
    maintenance_kcal: {
      min: assessment.calc_maintenance_kcal_min!,
      max: assessment.calc_maintenance_kcal_max!,
    },
    target_kcal: {
      min: assessment.calc_target_kcal_min!,
      max: assessment.calc_target_kcal_max!,
    },
    deficit_type: assessment.calc_deficit_type as DeficitType,
    protein_g: assessment.calc_protein_g!,
    fats_g: assessment.calc_fats_g!,
    carbs_g: assessment.calc_carbs_g!,
  };

  const plan_tier = subscription.plan_id as PlanId;
  const planConfig = PLANS[plan_tier];

  // ── 4. Límite de generaciones del mes ────────────────────────
  const monthYear = new Date().toISOString().slice(0, 7);
  if (planConfig.generations_per_month !== -1) {
    const used = await prisma.dietPlan.count({
      where: { user_id: user.id, month_year: monthYear },
    });
    if (used >= planConfig.generations_per_month) {
      return NextResponse.json(
        {
          error: `Ya usaste tus ${planConfig.generations_per_month} generación(es) de este mes.`,
        },
        { status: 429 }
      );
    }
  }

  // ── 5. Desactivar planes anteriores ──────────────────────────
  await prisma.dietPlan.updateMany({
    where: { user_id: user.id, is_active: true },
    data: { is_active: false },
  });

  // ── 6. Generar con Claude ────────────────────────────────────
  console.log(`[plan/generate] Generando KodaPlan para usuario ${user.id}`);
  let result;
  try {
    result = await generateKodaPlan({
      classified,
      requirements,
      plan_tier,
      full_name: user.user_metadata?.full_name as string | undefined,
    });
  } catch (err) {
    console.error('[plan/generate] Error en Claude:', err);
    return NextResponse.json(
      { error: 'No pudimos generar tu plan. Inténtalo de nuevo en un momento.' },
      { status: 503 }
    );
  }

  const { plan, usage } = result;
  console.log('[plan/generate] Usage:', usage);

  // ── 7. Persistir DietPlan (mismo modelo, nuevo formato JSON) ─
  const dietPlan = await prisma.dietPlan.create({
    data: {
      user_id: user.id,
      subscription_id: subscription.id,
      month_year: monthYear,
      plan_data: plan as unknown as object,
      calories_target: Math.round(
        (requirements.target_kcal.min + requirements.target_kcal.max) / 2
      ),
      protein_target_g: requirements.protein_g,
      carbs_target_g: requirements.carbs_g,
      fat_target_g: requirements.fats_g,
      is_active: true,
    },
  });

  // ── 8. Email (non-blocking) ──────────────────────────────────
  try {
    const { sendDietPlanReadyEmail } = await import('@/lib/resend/mailer');
    await sendDietPlanReadyEmail({
      to: user.email!,
      fullName: (user.user_metadata?.full_name as string | undefined) ?? user.email!,
      caloriesPerDay: dietPlan.calories_target ?? 0,
      proteinG: requirements.protein_g,
      carbsG: requirements.carbs_g,
      fatG: requirements.fats_g,
      monthYear,
    });
  } catch (emailErr) {
    console.error('[plan/generate] Error al enviar email:', emailErr);
  }

  return NextResponse.json({
    success: true,
    plan_id: dietPlan.id,
    usage,
  });
}
