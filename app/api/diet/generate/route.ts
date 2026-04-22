import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { fullHealthProfileSchema } from '@/lib/validations/health-profile';
import { generateDietPlan } from '@/lib/claude/diet-generator';
import { PLANS } from '@/types/database';
import type { PlanId } from '@/types/database';

// Vercel Pro: límite de 60s para serverless functions
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // ── 1. Verificar sesión ───────────────────────────────────
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // ── 2. Verificar suscripción activa ───────────────────────
    const subscription = await prisma.subscription.findFirst({
      where: { user_id: user.id, status: 'active' },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Necesitas una suscripción activa para generar tu plan' },
        { status: 403 }
      );
    }

    // ── 3. Guardar/actualizar perfil de salud ─────────────────
    const body = await request.json();
    const parsed = fullHealthProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos del perfil inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const profileData = parsed.data;

    await prisma.userHealthProfile.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        age: profileData.age,
        weight_kg: profileData.weight_kg,
        height_cm: profileData.height_cm,
        goal: profileData.goal,
        activity_level: profileData.activity_level,
        preferred_foods: profileData.preferred_foods,
        avoided_foods: profileData.avoided_foods,
        food_allergies: profileData.food_allergies,
        medical_conditions: profileData.medical_conditions || null,
      },
      update: {
        age: profileData.age,
        weight_kg: profileData.weight_kg,
        height_cm: profileData.height_cm,
        goal: profileData.goal,
        activity_level: profileData.activity_level,
        preferred_foods: profileData.preferred_foods,
        avoided_foods: profileData.avoided_foods,
        food_allergies: profileData.food_allergies,
        medical_conditions: profileData.medical_conditions || null,
      },
    });

    // ── 4. Verificar límite de generaciones del mes ───────────
    const plan = PLANS[subscription.plan_id as PlanId];
    const monthYear = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    if (plan.generations_per_month !== -1) {
      const generationsThisMonth = await prisma.dietPlan.count({
        where: {
          user_id: user.id,
          month_year: monthYear,
        },
      });

      if (generationsThisMonth >= plan.generations_per_month) {
        return NextResponse.json(
          {
            error: `Ya usaste tus ${plan.generations_per_month} generación(es) de este mes. Tu plan se renueva el próximo mes.`,
          },
          { status: 429 }
        );
      }
    }

    // ── 5. Desactivar planes anteriores ──────────────────────
    await prisma.dietPlan.updateMany({
      where: { user_id: user.id, is_active: true },
      data: { is_active: false },
    });

    // ── 6. Generar plan con Claude ────────────────────────────
    console.log(`[diet/generate] Generando plan para usuario ${user.id}`);
    const planData = await generateDietPlan(profileData);

    // ── 7. Guardar el nuevo plan ──────────────────────────────
    const dietPlan = await prisma.dietPlan.create({
      data: {
        user_id: user.id,
        subscription_id: subscription.id,
        month_year: monthYear,
        plan_data: planData as object,
        calories_target: planData.summary.calories_per_day,
        protein_target_g: planData.summary.protein_g,
        carbs_target_g: planData.summary.carbs_g,
        fat_target_g: planData.summary.fat_g,
        is_active: true,
      },
    });

    // ── 8. Email de plan listo (non-blocking) ─────────────────
    try {
      const { sendDietPlanReadyEmail } = await import('@/lib/resend/mailer');
      await sendDietPlanReadyEmail({
        to: user.email!,
        fullName: user.user_metadata?.full_name ?? user.email!,
        caloriesPerDay: planData.summary.calories_per_day,
        proteinG: planData.summary.protein_g,
        carbsG: planData.summary.carbs_g,
        fatG: planData.summary.fat_g,
        monthYear,
      });
    } catch (emailError) {
      console.error('[diet/generate] Error al enviar email de plan listo:', emailError);
    }

    return NextResponse.json({
      success: true,
      plan_id: dietPlan.id,
    });
  } catch (error) {
    console.error('[diet/generate] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error al generar el plan. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
