// ============================================================
// TIPOS DE BASE DE DATOS — NutriIA
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
export type PlanId = 'basico' | 'estandar' | 'premium';
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
  basico: {
    id: 'basico' as PlanId,
    name: 'Básico',
    price_soles: 29,
    price_cents: 2900,
    features: [
      'Plan de dieta mensual personalizado',
      'Generado por IA con tus datos',
      'Descarga en PDF',
      'Soporte por email',
    ],
    generations_per_month: 1,
    highlight: false,
  },
  estandar: {
    id: 'estandar' as PlanId,
    name: 'Estándar',
    price_soles: 49,
    price_cents: 4900,
    features: [
      'Todo lo del plan Básico',
      'Hasta 2 regeneraciones del plan por mes',
      'Ajuste de plan por cambio de objetivo',
      'Lista de compras semanal incluida',
    ],
    generations_per_month: 2,
    highlight: true, // Plan recomendado
  },
  premium: {
    id: 'premium' as PlanId,
    name: 'Premium',
    price_soles: 79,
    price_cents: 7900,
    features: [
      'Todo lo del plan Estándar',
      'Regeneraciones ilimitadas',
      'Plan de hidratación incluido',
      'Recetas detalladas por semana',
      'Soporte prioritario por WhatsApp',
    ],
    generations_per_month: -1, // -1 = ilimitado
    highlight: false,
  },
} as const;

export type PlanConfig = (typeof PLANS)[PlanId];
