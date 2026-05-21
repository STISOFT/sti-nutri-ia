// ============================================================
// TIPOS DE BASE DE DATOS — KODA
// Corresponden exactamente al esquema SQL de Supabase
// ============================================================

// ── TABLA: profiles ──────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ── TABLA: subscriptions ──────────────────────────────────────
export type PlanId = 'inicio' | 'core' | 'pro';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'pending';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: PlanId;
  status: SubscriptionStatus;
  culqi_order_id: string | null;
  culqi_charge_id: string | null;
  amount_cents: number;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

// ── TABLA: user_health_profiles ───────────────────────────────
export type DietGoal = 'perder_peso' | 'ganar_peso' | 'mantener_peso' | 'ganar_musculo';
export type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';

export interface UserHealthProfile {
  id: string;
  user_id: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  goal: DietGoal;
  activity_level: ActivityLevel;
  preferred_foods: string[];
  avoided_foods: string[];
  food_allergies: string[];
  medical_conditions: string | null;
  created_at: string;
  updated_at: string;
}

// ── ESTRUCTURA DEL PLAN DE DIETA (JSON de Claude) ────────────
export interface MealItem {
  name: string;
  description: string;
  calories: number;
  ingredients: string[];
  prep_time_min?: number;
}

export interface DayMeals {
  desayuno: MealItem;
  media_manana: MealItem;
  almuerzo: MealItem;
  media_tarde: MealItem;
  cena: MealItem;
}

export interface DietDay {
  day: number;
  day_name: string;
  meals: DayMeals;
  total_calories: number;
  daily_tip: string;
}

export interface DietWeek {
  week_number: number;
  theme: string;
  days: DietDay[];
  shopping_list: string[];
}

export interface DietSummary {
  calories_per_day: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
  notes: string;
}

export interface DietPlanData {
  summary: DietSummary;
  weeks: DietWeek[];
}

// ── TABLA: diet_plans ─────────────────────────────────────────
export interface DietPlan {
  id: string;
  user_id: string;
  subscription_id: string | null;
  month_year: string; // formato: 'YYYY-MM', ej: '2026-04'
  plan_data: DietPlanData;
  calories_target: number | null;
  protein_target_g: number | null;
  carbs_target_g: number | null;
  fat_target_g: number | null;
  generated_at: string;
  is_active: boolean;
}

// ── TIPO DATABASE para el cliente tipado de Supabase ─────────
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>;
      };
      user_health_profiles: {
        Row: UserHealthProfile;
        Insert: Omit<UserHealthProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserHealthProfile, 'id' | 'created_at'>>;
      };
      diet_plans: {
        Row: DietPlan;
        Insert: Omit<DietPlan, 'id' | 'generated_at'>;
        Update: Partial<Omit<DietPlan, 'id' | 'generated_at'>>;
      };
    };
  };
};

// ── PLANES DE SUSCRIPCIÓN ─────────────────────────────────────
export const PLANS = {
  inicio: {
    id: 'inicio' as PlanId,
    name: 'PLAN INICIO',
    subtitle: 'Empieza a corregir tu cuerpo',
    target: 'Personas que están empezando o necesitan una base clara',
    cta: 'Empezar',
    price_soles: 29.9,
    price_cents: 2990,
    features: [
      'Estructura base de alimentación (simple y clara)',
      'Rutina de entrenamiento (gym o calistenia) según tu nivel',
      'Guía práctica para organizar tu día',
      'Recomendaciones generales',
    ],
    generations_per_month: 1,
    // Bloque 2 del Método: básico por 7 días, sin seguimiento.
    follow_up: 'sin_seguimiento' as const,
    highlight: false,
  },
  core: {
    id: 'core' as PlanId,
    name: 'PLAN CORE',
    subtitle: 'Optimiza tu cuerpo de verdad',
    target: 'Personas que quieren resultados reales y adaptados',
    cta: 'Empezar con KODA',
    price_soles: 59.9,
    price_cents: 5990,
    features: [
      'Alimentación adaptada a tu rutina (horarios, comidas y hábitos)',
      'Rutina según tu etapa (gym o calistenia)',
      'Ajuste quincenal según tu progreso',
      'Seguimiento y soporte continuo',
      'Recomendaciones específicas acorde a tu rutina',
      'Curso base en video para aprender calistenia',
    ],
    generations_per_month: 2,
    // Bloque 2: intermedio con seguimiento periódico cada 2 semanas.
    follow_up: 'quincenal' as const,
    highlight: true, // Plan recomendado
  },
  pro: {
    id: 'pro' as PlanId,
    name: 'PLAN PRO',
    subtitle: 'Corrección completa + soporte',
    target: 'Personas que quieren hacerlo al 100% y acelerar resultados',
    cta: 'Acceder',
    price_soles: 99.9,
    price_cents: 9990,
    features: [
      'Estrategia de alimentación totalmente personalizada',
      'Ajustes frecuentes según tu progreso',
      'Prioridad en revisión y acompañamiento directo',
      'Llamadas y evaluación semanal',
      'Acceso a comunidad privada',
      'Beneficios adicionales (descuentos, entrenamientos, etc.)',
    ],
    generations_per_month: -1, // -1 = ilimitado
    // Bloque 2: avanzado con seguimiento frecuente y ajustes constantes.
    follow_up: 'semanal' as const,
    highlight: false,
  },
} as const;

export type PlanConfig = (typeof PLANS)[PlanId];
