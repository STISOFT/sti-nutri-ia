import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { fullHealthProfileSchema } from '@/lib/validations/health-profile';

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const parsed = fullHealthProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await prisma.userHealthProfile.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        age: data.age,
        weight_kg: data.weight_kg,
        height_cm: data.height_cm,
        goal: data.goal,
        activity_level: data.activity_level,
        preferred_foods: data.preferred_foods,
        avoided_foods: data.avoided_foods,
        food_allergies: data.food_allergies,
        medical_conditions: data.medical_conditions || null,
      },
      update: {
        age: data.age,
        weight_kg: data.weight_kg,
        height_cm: data.height_cm,
        goal: data.goal,
        activity_level: data.activity_level,
        preferred_foods: data.preferred_foods,
        avoided_foods: data.avoided_foods,
        food_allergies: data.food_allergies,
        medical_conditions: data.medical_conditions || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[profile/update] Error:', error);
    return NextResponse.json({ error: 'Error al guardar el perfil' }, { status: 500 });
  }
}
