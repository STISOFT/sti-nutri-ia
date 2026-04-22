<div align="center">

<img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" alt="Next.js" width="80" />

# NutriIA

**Plataforma SaaS de planes de alimentación personalizados con Inteligencia Artificial**

Diseñada para el mercado peruano · Generación de planes de 30 días en segundos

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ¿Qué es NutriIA?

NutriIA genera planes de dieta personalizados de 30 días usando la API de Claude (Anthropic). El usuario completa su perfil de salud (peso, talla, objetivo, preferencias alimentarias peruanas) y en segundos recibe un plan completo con:

- 5 comidas diarias organizadas por semana
- Macros calculados (calorías, proteínas, carbohidratos, grasas)
- Lista de compras semanal con ingredientes peruanos
- Consejos nutricionales diarios
- Descarga en PDF

### Planes disponibles

| Plan | Precio | Regeneraciones |
|------|--------|----------------|
| Básico | S/29/mes | 1 por mes |
| Estándar | S/49/mes | 2 por mes |
| Premium | S/79/mes | Ilimitadas |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router, TypeScript strict) |
| UI | shadcn/ui + Tailwind CSS v4 + base-nova |
| Autenticación | Supabase Auth (`@supabase/ssr`) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| IA | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Pagos | Culqi (pasarela peruana) |
| Emails | Resend + React Email |
| Estado | Zustand |
| Validación | Zod + React Hook Form |
| Fuentes | Inter + Plus Jakarta Sans |

---

## Requisitos previos

- Node.js 18+
- npm / yarn / pnpm
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Resend](https://resend.com) (emails)
- Cuenta en [Culqi](https://culqi.com) (pagos — opcional para desarrollo)
- API Key de [Anthropic](https://console.anthropic.com) (generación IA)

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/STISOFT/sti-nutri-ia.git
cd sti-nutri-ia
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.local.example .env.local
```

```env
# ─── SUPABASE ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# ─── ANTHROPIC CLAUDE API ────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ─── RESEND (emails transaccionales) ─────────────────────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=NutriIA <hola@tudominio.com>

# ─── CULQI (pasarela de pagos Perú) ──────────────────────────
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_live_...
CULQI_SECRET_KEY=sk_live_...
CULQI_WEBHOOK_SECRET=...

# ─── APP ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NutriIA
```

### 4. Configurar la base de datos en Supabase

En el SQL Editor de tu proyecto Supabase, ejecuta el schema completo ubicado en:

```
/docs/schema.sql
```

Esto crea las 4 tablas principales con RLS habilitado:
- `profiles` — datos del usuario
- `subscriptions` — suscripciones y pagos
- `user_health_profiles` — perfil de salud para generar el plan
- `diet_plans` — planes de dieta generados por IA

### 5. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Estructura del proyecto

```
sti-nutri-ia/
├── app/
│   ├── (public)/           # Landing, auth, planes
│   │   ├── page.tsx        # Landing page
│   │   ├── auth/           # register, login, verify-email
│   │   └── planes/         # Página de precios + checkout
│   ├── (dashboard)/        # Rutas protegidas del usuario
│   │   ├── dashboard/
│   │   ├── mi-plan/
│   │   ├── historial/
│   │   ├── perfil/
│   │   └── suscripcion/
│   ├── onboarding/         # Wizard de perfil de salud
│   └── api/
│       ├── auth/callback/  # Supabase OAuth callback
│       ├── payments/       # Culqi: confirm, webhook
│       └── diet/           # Generación IA con Claude
├── components/
│   ├── auth/               # RegisterForm, LoginForm
│   ├── dashboard/          # OnboardingWizard, DietPlanView, etc.
│   ├── landing/            # Hero, Benefits, Pricing, FAQ, etc.
│   └── shared/             # Navbar, Footer, CulqiCheckout
├── emails/                 # Plantillas React Email
├── lib/
│   ├── supabase/           # Clientes browser, server, service
│   ├── claude/             # Generador de planes con IA
│   ├── culqi/              # Cliente de pagos Culqi
│   ├── resend/             # Mailer centralizado
│   ├── stores/             # Zustand stores
│   └── validations/        # Schemas Zod
└── types/
    └── database.ts         # Tipos TypeScript + constante PLANS
```

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

---

## Flujo de la aplicación

```
/ (Landing)
    ↓ Empezar gratis
/auth/register → verificar email → /api/auth/callback
    ↓
/planes (elegir plan + pagar con Culqi)
    ↓
/onboarding (wizard: datos físicos → objetivo → preferencias)
    ↓ Claude genera plan en ~30s
/mi-plan (ver plan 30 días, macros, lista de compras, PDF)
```

---

## Despliegue en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Selecciona la rama `release` como **Production Branch**
3. Agrega todas las variables de entorno en **Settings → Environment Variables**
4. Cambia `NEXT_PUBLIC_APP_URL` a tu dominio de producción

```bash
NEXT_PUBLIC_APP_URL=https://nutriia.pe
```

---

## Estado del desarrollo

| Módulo | Estado |
|--------|--------|
| M1 — Setup y fundación | ✅ Completo |
| M2 — Autenticación | ✅ Completo |
| M3 — Landing page | ✅ Completo |
| M4 — Pagos Culqi | ✅ Completo |
| M5 — Emails Resend | ✅ Completo |
| M6 — Onboarding + IA | 🔄 En progreso |
| M7 — Panel de usuario | ⏳ Pendiente |
| M8 — Pulido y deploy | ⏳ Pendiente |

---

<div align="center">
  <sub>Desarrollado por <a href="https://github.com/STISOFT">STISOFT</a> · Lima, Perú · 2026</sub>
</div>
