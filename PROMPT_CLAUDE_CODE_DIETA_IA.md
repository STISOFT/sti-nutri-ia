# 🚀 PROMPT MAESTRO — PLATAFORMA DIETA IA PERSONALIZADA
# Usar en: Claude Code (terminal con `claude` o claude.ai/code)

---

Eres un experto desarrollador fullstack senior. Vamos a construir juntos una
plataforma SaaS de planes de dieta personalizados con IA, de forma incremental,
módulo por módulo. Al terminar cada módulo me avisas antes de continuar.

---

## 🎯 DESCRIPCIÓN DEL PRODUCTO

Plataforma web donde los usuarios pagan una suscripción mensual y reciben un
plan de alimentación personalizado de 30 días generado por IA (Claude API),
basado en sus datos físicos y preferencias alimentarias. Similar a Fitia pero
con modelo propio de suscripción y generación automática mensual.

---

## 🛠️ STACK TECNOLÓGICO DEFINITIVO

- **Framework:** Next.js 14 con App Router y TypeScript estricto
- **Estilos:** Tailwind CSS + shadcn/ui
- **Base de datos:** Supabase (PostgreSQL + Auth + Storage)
- **Autenticación:** Supabase Auth — Email + contraseña con verificación de email obligatoria
- **Email transaccional:** Resend (resend.com) con React Email para plantillas HTML
- **Pagos:** Culqi (pasarela peruana — acepta Visa/MC locales)
- **IA:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Hosting:** Vercel (Pro plan)
- **Validación de formularios:** React Hook Form + Zod
- **Estado global:** Zustand (solo donde sea necesario)
- **PDF:** react-pdf para exportar el plan de dieta

---

## 🗄️ ESQUEMA DE BASE DE DATOS (Supabase — PostgreSQL)

Ejecutar este SQL exactamente en el editor de Supabase:

```sql
-- EXTENSIONES
create extension if not exists "uuid-ossp";

-- TABLA: profiles
-- Se crea automáticamente al registrarse un usuario en Supabase Auth
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text unique not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLA: subscriptions
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id text not null check (plan_id in ('basico', 'estandar', 'premium')),
  status text not null check (status in ('active', 'inactive', 'cancelled', 'pending')),
  culqi_order_id text,
  culqi_charge_id text,
  amount_cents integer not null,
  currency text default 'PEN',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLA: user_health_profiles
-- Datos del formulario post-compra
create table public.user_health_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  age integer not null check (age >= 14 and age <= 100),
  weight_kg numeric(5,2) not null,
  height_cm numeric(5,2) not null,
  goal text not null check (goal in ('perder_peso', 'ganar_peso', 'mantener_peso', 'ganar_musculo')),
  activity_level text not null check (activity_level in ('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo')),
  preferred_foods text[] default '{}',
  avoided_foods text[] default '{}',
  food_allergies text[] default '{}',
  medical_conditions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLA: diet_plans
create table public.diet_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id),
  month_year text not null, -- formato: '2026-04'
  plan_data jsonb not null, -- JSON completo del plan generado por Claude
  calories_target integer,
  protein_target_g integer,
  carbs_target_g integer,
  fat_target_g integer,
  generated_at timestamptz default now(),
  is_active boolean default true,
  unique(user_id, month_year)
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_health_profiles enable row level security;
alter table public.diet_plans enable row level security;

-- Políticas: cada usuario solo ve y edita sus propios datos
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Service role can manage subscriptions" on public.subscriptions for all using (true) with check (true);

create policy "Users can view own health profile" on public.user_health_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own health profile" on public.user_health_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own health profile" on public.user_health_profiles for update using (auth.uid() = user_id);

create policy "Users can view own diet plans" on public.diet_plans for select using (auth.uid() = user_id);
create policy "Service role can manage diet plans" on public.diet_plans for all using (true) with check (true);

-- TRIGGER: crear profile automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 📁 ESTRUCTURA DE CARPETAS DEL PROYECTO

```
/
├── app/
│   ├── (public)/                    # Rutas públicas (sin auth)
│   │   ├── page.tsx                 # Landing page
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   └── planes/page.tsx          # Página de precios pública
│   ├── (dashboard)/                 # Rutas protegidas (con auth)
│   │   ├── layout.tsx               # Layout con sidebar
│   │   ├── dashboard/page.tsx       # Panel principal del usuario
│   │   ├── mi-plan/page.tsx         # Plan de dieta actual
│   │   ├── historial/page.tsx       # Historial de planes
│   │   ├── perfil/page.tsx          # Datos personales y de salud
│   │   └── suscripcion/page.tsx     # Gestión de suscripción
│   ├── onboarding/
│   │   └── page.tsx                 # Formulario post-pago (datos de salud)
│   └── api/
│       ├── auth/
│       │   └── callback/route.ts    # Callback Supabase Auth
│       ├── payments/
│       │   ├── create-order/route.ts
│       │   ├── confirm/route.ts
│       │   └── webhook/route.ts
│       ├── diet/
│       │   └── generate/route.ts    # Generar plan con Claude API
│       └── emails/
│           └── send/route.ts
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Benefits.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   └── CTABanner.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── DietPlanView.tsx
│   │   └── HealthProfileForm.tsx
│   └── shared/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── emails/                          # Plantillas React Email
│   ├── WelcomeEmail.tsx
│   ├── PaymentConfirmationEmail.tsx
│   ├── DietPlanReadyEmail.tsx
│   ├── SubscriptionRenewalEmail.tsx
│   └── PasswordResetEmail.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Cliente browser
│   │   ├── server.ts                # Cliente server (SSR)
│   │   └── middleware.ts
│   ├── claude/
│   │   └── diet-generator.ts
│   ├── culqi/
│   │   └── client.ts
│   ├── resend/
│   │   └── mailer.ts
│   └── validations/
│       ├── auth.ts
│       ├── health-profile.ts
│       └── payment.ts
├── middleware.ts                    # Protección de rutas
├── types/
│   └── database.ts
└── .env.local
```

---

## 🔐 VARIABLES DE ENTORNO (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@tudominio.com

# Culqi
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_live_...
CULQI_PRIVATE_KEY=sk_live_...
CULQI_WEBHOOK_SECRET=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NutriIA
```

---

## 🔒 SISTEMA DE AUTENTICACIÓN (Detalle completo)

### Flujo de registro:
1. Usuario llena formulario: nombre completo, email, contraseña (mín. 8 chars, 1 mayúscula, 1 número)
2. Supabase envía email de verificación automáticamente
3. Redirigir a página `/auth/verify-email` con mensaje "Revisa tu correo"
4. Usuario hace click en el link del email → redirige a `/api/auth/callback`
5. Callback procesa la sesión y redirige a `/dashboard`

### Validación de contraseña (Zod):
```typescript
const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe tener al menos un número');
```

### Flujo de login:
1. Email + contraseña
2. Si email no verificado → mostrar alerta con botón "Reenviar verificación"
3. Si credenciales correctas → verificar si tiene health_profile
   - Si NO tiene health_profile y tiene suscripción activa → `/onboarding`
   - Si SÍ tiene health_profile → `/dashboard`
   - Si no tiene suscripción → `/planes`

### Middleware de protección (middleware.ts):
```typescript
// Rutas protegidas: /dashboard/*, /onboarding, /mi-plan/*, /historial/*, /perfil/*, /suscripcion/*
// Si no hay sesión → redirigir a /auth/login?redirectTo=<ruta-original>
// Si hay sesión pero email no verificado → redirigir a /auth/verify-email
```

### Configuración requerida en Supabase Dashboard:
- Auth → Email Templates → "Confirm signup": activar y personalizar
- Auth → URL Configuration → Site URL: `https://tudominio.com`
- Auth → Redirect URLs: `https://tudominio.com/api/auth/callback`
- Auth → Providers → Email → "Confirm email": ON
- Auth → Providers → Email → "Secure email change": ON

---

## 💳 PLANES DE SUSCRIPCIÓN

```typescript
export const PLANS = {
  basico: {
    id: 'basico',
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
    id: 'estandar',
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
    id: 'premium',
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
    generations_per_month: -1, // ilimitado
    highlight: false,
  },
} as const;
```

---

## 🧠 GENERACIÓN DE DIETA CON CLAUDE API

### Archivo: `lib/claude/diet-generator.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateDietPlan(healthProfile: UserHealthProfile): Promise<DietPlanData> {
  const bmi = healthProfile.weight_kg / Math.pow(healthProfile.height_cm / 100, 2);

  const prompt = `Eres un nutricionista certificado experto. Genera un plan de alimentación personalizado
de exactamente 30 días para el siguiente usuario. El plan debe ser realista, balanceado y adaptado
al contexto alimentario peruano (incluye alimentos locales como quinua, kiwicha, ají amarillo, etc.).

## DATOS DEL USUARIO:
- Edad: ${healthProfile.age} años
- Peso actual: ${healthProfile.weight_kg} kg
- Estatura: ${healthProfile.height_cm} cm
- IMC calculado: ${bmi.toFixed(1)}
- Objetivo: ${healthProfile.goal}
- Nivel de actividad: ${healthProfile.activity_level}
- Alimentos preferidos: ${healthProfile.preferred_foods.join(', ') || 'No especificado'}
- Alimentos que evita: ${healthProfile.avoided_foods.join(', ') || 'Ninguno'}
- Alergias alimentarias: ${healthProfile.food_allergies.join(', ') || 'Ninguna'}
- Condiciones médicas: ${healthProfile.medical_conditions || 'Ninguna'}

## INSTRUCCIONES DE FORMATO:
Responde ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional:

{
  "summary": {
    "calories_per_day": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "water_ml": number,
    "notes": "string con recomendaciones generales"
  },
  "weeks": [
    {
      "week_number": 1,
      "theme": "string (ej: Adaptación inicial)",
      "days": [
        {
          "day": 1,
          "day_name": "Lunes",
          "meals": {
            "desayuno": {
              "name": "string",
              "description": "string",
              "calories": number,
              "ingredients": ["string"],
              "prep_time_min": number
            },
            "media_manana": {
              "name": "string",
              "description": "string",
              "calories": number,
              "ingredients": ["string"]
            },
            "almuerzo": {
              "name": "string",
              "description": "string",
              "calories": number,
              "ingredients": ["string"],
              "prep_time_min": number
            },
            "media_tarde": {
              "name": "string",
              "description": "string",
              "calories": number,
              "ingredients": ["string"]
            },
            "cena": {
              "name": "string",
              "description": "string",
              "calories": number,
              "ingredients": ["string"],
              "prep_time_min": number
            }
          },
          "total_calories": number,
          "daily_tip": "string con tip nutricional del día"
        }
      ],
      "shopping_list": ["string con ingredientes de la semana"]
    }
  ]
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as DietPlanData;
}
```

---

## 📧 EMAILS CON RESEND + REACT EMAIL

### 5 emails a implementar:

**1. Bienvenida** — `emails/WelcomeEmail.tsx`
- Trigger: cuando el usuario confirma su email (webhook Supabase o post-callback)
- Contenido: Bienvenida con nombre, pasos para empezar (3 pasos), CTA "Ver planes"

**2. Confirmación de pago** — `emails/PaymentConfirmationEmail.tsx`
- Trigger: webhook de Culqi confirma pago exitoso → `/api/payments/webhook`
- Contenido: plan comprado, monto en soles, fecha, CTA "Completar mi perfil"

**3. Plan de dieta listo** — `emails/DietPlanReadyEmail.tsx`
- Trigger: cuando Claude termina de generar el plan → `/api/diet/generate`
- Contenido: nombre del usuario, resumen de macros (calorías, proteína, carbos, grasa), CTA "Ver mi plan"

**4. Recordatorio de renovación** — `emails/SubscriptionRenewalEmail.tsx`
- Trigger: 5 días antes del vencimiento (Supabase Edge Function con cron o Vercel Cron)
- Contenido: aviso de renovación, fecha, monto, CTA "Gestionar suscripción"

**5. Recuperación de contraseña** — `emails/PasswordResetEmail.tsx`
- Trigger: usuario solicita reset → Supabase Auth lo maneja, pero personalizar el template
- Configurar también en Supabase Dashboard → Auth → Email Templates → Reset Password

### Función centralizada `lib/resend/mailer.ts`:
```typescript
import { Resend } from 'resend';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;

export async function sendWelcomeEmail(to: string, name: string) {
  const html = await render(WelcomeEmail({ name }));
  return resend.emails.send({ from: FROM, to, subject: '¡Bienvenido a NutriIA! 🥗', html });
}

export async function sendPaymentConfirmationEmail(to: string, data: PaymentEmailData) { ... }
export async function sendDietPlanReadyEmail(to: string, data: DietReadyEmailData) { ... }
export async function sendRenewalReminderEmail(to: string, data: RenewalEmailData) { ... }
```

---

## 🔄 FLUJO COMPLETO DEL USUARIO

```
1. LLEGADA → Landing page (/)
2. REGISTRO → /auth/register
   └── Email de verificación enviado por Supabase
3. VERIFICACIÓN → Usuario confirma email → /api/auth/callback → /dashboard
   └── Email de bienvenida enviado por Resend
4. SELECCIÓN DE PLAN → /planes
5. PAGO → Modal Culqi Checkout
   └── Webhook confirma → suscripción creada en BD
   └── Email de confirmación de pago enviado
6. ONBOARDING → /onboarding (wizard 3 pasos)
   Paso 1: Edad, peso, estatura
   Paso 2: Objetivo, nivel de actividad
   Paso 3: Alimentos preferidos, evitados, alergias
   └── Submit → Claude API genera el plan (30-60 seg)
   └── Pantalla "Generando tu plan..." con animación
   └── Plan guardado en BD
   └── Email "Tu plan está listo" enviado
   └── Redirige a /mi-plan
7. PANEL → /dashboard, /mi-plan, /historial, /perfil, /suscripcion
```

---

## 🎨 DISEÑO, ESTILO Y SISTEMA DE THEMING

### Sistema de colores: shadcn/ui con HSL variables + Dark Mode

Toda la app usa variables CSS en formato HSL, lo que permite cambiar el tema
completo editando solo el archivo `app/globals.css`. Nunca usar colores
hardcodeados como `#16a34a` — siempre usar las variables semánticas de shadcn/ui
como `bg-primary`, `text-foreground`, `border`, etc.

### Configuración completa de `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ─── MODO CLARO ─── */

    /* Fondos */
    --background: 0 0% 98%;          /* #fafafa — fondo general */
    --foreground: 222 47% 11%;       /* #111827 — texto principal */

    /* Superficie de cards, modales, etc. */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    /* Popovers y dropdowns */
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* ── COLOR PRIMARIO: Verde nutrición ── */
    /* Para cambiar el color del botón principal, CTA y elementos de marca,
       solo cambia estos 3 valores HSL. Ejemplo azul: 221 83% 53% */
    --primary: 142 76% 36%;          /* #16a34a — verde principal */
    --primary-foreground: 0 0% 100%; /* blanco — texto sobre botones primarios */

    /* ── COLOR SECUNDARIO ── */
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;

    /* ── ACCENT / CTA ── */
    /* Para cambiar el color de CTAs secundarios y highlights */
    --accent: 24 95% 53%;            /* #f97316 — naranja */
    --accent-foreground: 0 0% 100%;

    /* Estados */
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%; /* #6b7280 — texto secundario */

    /* Destructivo / Error */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Bordes e inputs */
    --border: 214 32% 91%;           /* #e5e7eb */
    --input: 214 32% 91%;
    --ring: 142 76% 36%;             /* mismo que primary para el focus ring */

    /* Radios de bordes — cambiar aquí afecta TODOS los componentes */
    --radius: 0.625rem;              /* 10px — aspecto moderno */

    /* ── COLORES SEMÁNTICOS EXTRA (para barras de macros) ── */
    --macro-protein: 221 83% 53%;    /* azul — proteína */
    --macro-carbs: 38 92% 50%;       /* amarillo — carbohidratos */
    --macro-fat: 24 95% 53%;         /* naranja — grasa */
    --macro-calories: 142 76% 36%;   /* verde — calorías */

    /* Chart colors para recharts (si se usa) */
    --chart-1: 142 76% 36%;
    --chart-2: 221 83% 53%;
    --chart-3: 38 92% 50%;
    --chart-4: 24 95% 53%;
    --chart-5: 280 65% 60%;

    /* Sidebar */
    --sidebar-background: 0 0% 100%;
    --sidebar-foreground: 222 47% 11%;
    --sidebar-primary: 142 76% 36%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 210 40% 96%;
    --sidebar-accent-foreground: 222 47% 11%;
    --sidebar-border: 214 32% 91%;
    --sidebar-ring: 142 76% 36%;
  }

  .dark {
    /* ─── MODO OSCURO ─── */

    --background: 222 47% 7%;        /* gris muy oscuro, casi negro */
    --foreground: 210 40% 98%;       /* casi blanco */

    --card: 222 47% 10%;
    --card-foreground: 210 40% 98%;

    --popover: 222 47% 10%;
    --popover-foreground: 210 40% 98%;

    /* Verde sigue siendo primario en dark, pero ligeramente más brillante */
    --primary: 142 70% 45%;
    --primary-foreground: 0 0% 100%;

    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;

    --accent: 24 95% 58%;
    --accent-foreground: 0 0% 100%;

    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;

    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 100%;

    --border: 217 33% 20%;
    --input: 217 33% 20%;
    --ring: 142 70% 45%;

    --macro-protein: 221 83% 63%;
    --macro-carbs: 38 92% 55%;
    --macro-fat: 24 95% 60%;
    --macro-calories: 142 70% 45%;

    --chart-1: 142 70% 45%;
    --chart-2: 221 83% 63%;
    --chart-3: 38 92% 55%;
    --chart-4: 24 95% 60%;
    --chart-5: 280 65% 65%;

    --sidebar-background: 222 47% 9%;
    --sidebar-foreground: 210 40% 98%;
    --sidebar-primary: 142 70% 45%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 217 33% 17%;
    --sidebar-accent-foreground: 210 40% 98%;
    --sidebar-border: 217 33% 20%;
    --sidebar-ring: 142 70% 45%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-plus-jakarta), sans-serif;
  }
}
```

### Configurar tipografía en `app/layout.tsx`:

```typescript
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${inter.variable} font-[family-name:var(--font-inter)]`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Toggle de dark mode — instalar next-themes:

```bash
npm install next-themes
```

Crear `components/shared/ThemeToggle.tsx` con un botón que llame a `useTheme()`
de next-themes, mostrando ícono de sol (modo claro) y luna (modo oscuro).
Colocar este botón en el Navbar y en el Sidebar del dashboard.

### Cómo cambiar el tema completo en el futuro:

Para cambiar la paleta de color del proyecto entero, solo editar en `globals.css`:
- `--primary` y `--primary-foreground` → cambia botones, links, CTAs
- `--accent` y `--accent-foreground` → cambia highlights secundarios
- `--radius` → cambia el redondeo de todos los componentes (0 = cuadrado, 1rem = muy redondeado)
- Los valores del bloque `.dark {}` para ajustar el modo oscuro

**Paletas de ejemplo listas para usar:**
```css
/* Azul corporativo */
--primary: 221 83% 53%;   /* #3b82f6 */

/* Púrpura premium */
--primary: 263 70% 58%;   /* #8b5cf6 */

/* Rojo energético */
--primary: 0 72% 51%;     /* #ef4444 */

/* Teal salud */
--primary: 173 80% 36%;   /* #0d9488 */
```

### Reglas de uso en componentes:

- ✅ CORRECTO: `className="bg-primary text-primary-foreground"`
- ✅ CORRECTO: `className="bg-background border-border text-foreground"`
- ✅ CORRECTO: `className="text-muted-foreground"`
- ❌ INCORRECTO: `className="bg-green-600 text-white"` (hardcodeado, no respeta el tema)
- ❌ INCORRECTO: `style={{ color: '#16a34a' }}` (hardcodeado)

### Configuración `tailwind.config.ts` — asegurarse de incluir:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './emails/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
      colors: {
        // Semánticos de shadcn/ui — NO cambiar los nombres
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Colores semánticos extra
        macro: {
          protein: 'hsl(var(--macro-protein))',
          carbs: 'hsl(var(--macro-carbs))',
          fat: 'hsl(var(--macro-fat))',
          calories: 'hsl(var(--macro-calories))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

**Íconos:** Lucide React
**Tono visual:** Moderno, limpio, confiable — estilo app de salud premium
**Toasts:** Sonner (compatible con dark mode automáticamente con `theme="system"`)

---

## 📦 COMANDOS DE INSTALACIÓN

```bash
npx create-next-app@latest nutriia --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
cd nutriia

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label form select textarea tabs badge progress skeleton toast dialog sheet separator accordion

# Dependencias principales
npm install @supabase/supabase-js @supabase/ssr
npm install @anthropic-ai/sdk
npm install resend @react-email/components @react-email/render
npm install react-hook-form @hookform/resolvers zod
npm install zustand
npm install lucide-react
npm install @react-pdf/renderer
npm install date-fns
npm install clsx tailwind-merge
npm install sonner
npm install next-themes      # dark mode toggle
npm install tailwindcss-animate  # animaciones shadcn/ui
```

---

## 🚦 ORDEN DE DESARROLLO (8 módulos)

### MÓDULO 1 — Setup y Fundación
- Crear proyecto con todas las dependencias
- Configurar Supabase: ejecutar SQL del schema completo
- Crear clientes Supabase (browser y server) con @supabase/ssr
- Implementar middleware.ts con protección de rutas
- Crear tipos TypeScript del schema (types/database.ts)
- Configurar variables de entorno

### MÓDULO 2 — Autenticación completa
- /auth/register con validación Zod (nombre, email, password con reglas)
- /auth/login con manejo de email no verificado
- /auth/verify-email (página de espera + reenvío)
- /api/auth/callback (procesa token de Supabase)
- Recuperación de contraseña (Supabase nativo)
- Logout desde cualquier página

### MÓDULO 3 — Landing Page
- Navbar responsive con links y CTA
- Hero: headline, subheadline, CTA principal, imagen hero
- Benefits: 6 beneficios con íconos Lucide
- HowItWorks: 3 pasos con números grandes y animaciones
- Testimonials: 3 cards con foto, nombre, resultado
- Pricing: 3 cards, plan Estándar destacado con badge "Más popular"
- FAQ: acordeón con 8 preguntas frecuentes
- CTABanner: sección final antes del footer con urgencia
- Footer con links y redes

### MÓDULO 4 — Pagos con Culqi
- Integrar script de Culqi.js en el layout
- POST /api/payments/create-order → crea orden en Culqi API
- POST /api/payments/confirm → confirma el cargo
- POST /api/payments/webhook → recibe eventos de Culqi, verifica firma HMAC
- Crear/actualizar registro en tabla subscriptions
- Manejo de errores de pago con mensajes claros al usuario
- Enviar email de confirmación de pago

### MÓDULO 5 — Emails con Resend + React Email
- Configurar dominio en Resend
- 5 plantillas HTML en React Email (responsivas, en español, verde/blanco)
- Función mailer.ts centralizada
- Integrar envíos en los triggers correctos del flujo

### MÓDULO 6 — Onboarding y Generación IA
- Wizard de 3 pasos con barra de progreso visible
- Validación Zod por paso antes de avanzar
- Guardar health_profile en Supabase al finalizar
- POST /api/diet/generate:
  - Recibe user_id
  - Obtiene health_profile de BD
  - Llama a Claude API con el prompt
  - Guarda resultado en diet_plans
  - Envía email "plan listo"
- Pantalla de loading con animación SVG o Lottie
- Manejo de timeout (Claude puede tardar hasta 60 seg)

### MÓDULO 7 — Panel de Usuario
- Layout dashboard con sidebar (colapsable en móvil)
- /dashboard: saludo, resumen de suscripción, macros del día
- /mi-plan:
  - Tabs por semana (Semana 1, 2, 3, 4)
  - Vista diaria con 5 comidas expandibles
  - Macros del día como barras de progreso
  - Lista de compras de la semana
  - Botón descargar PDF (react-pdf)
- /historial: grid de planes anteriores con mes/año
- /perfil: formulario editable de datos de salud + opción de regenerar plan
- /suscripcion: estado, fecha renovación, plan activo, botón cancelar

### MÓDULO 8 — Pulido y Deploy
- Skeleton loaders en todas las páginas con fetch
- Error boundaries y páginas de error (error.tsx, not-found.tsx)
- Metadata SEO completa (title, description, og:image) en cada página
- sitemap.xml y robots.txt
- Responsive móvil revisado en todas las páginas
- Configurar variables de entorno en Vercel Dashboard
- Deploy desde GitHub → Vercel con preview automático por PR

---

## ⚙️ INSTRUCCIONES PARA CLAUDE CODE

1. **Empieza por el MÓDULO 1.** Crea el proyecto, instala dependencias y configura Supabase.
2. Usa TypeScript estricto (`strict: true` en tsconfig) en todos los archivos.
3. Todos los API routes deben validar inputs con Zod antes de procesar.
4. Usa el cliente de Supabase correcto:
   - `createBrowserClient` en Client Components ('use client')
   - `createServerClient` en Server Components, API routes y Server Actions
5. Maneja todos los errores explícitamente. Nunca uses `any`. Nunca ignores excepciones.
6. **Al terminar cada módulo, muéstrame un resumen de lo implementado y espera mi confirmación antes de continuar.**
7. Si necesitas tomar una decisión de arquitectura no especificada aquí, preséntame las opciones antes de implementar.
8. Comenta el código en español para facilitar el mantenimiento.
9. Usa `sonner` para todos los toasts de feedback al usuario.
10. Todos los formularios deben tener loading state en el botón de submit.

---

## 📝 REFERENCIAS

- Culqi Docs: https://docs.culqi.com
- Supabase Auth + Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs
- React Email: https://react.email/docs
- Claude API: https://docs.anthropic.com/en/api
- Nombre del proyecto: **NutriIA** (puede cambiarse)
- Mercado objetivo: Perú → precios en Soles (PEN), alimentos locales en los planes
- Idioma del sistema: español latinoamericano, tono amigable y motivador
