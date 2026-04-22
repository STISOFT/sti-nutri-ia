<div align="center">

<img src="https://nextjs.org/icons/next.svg" alt="Next.js" width="80" />

# NutriIA

**Plataforma SaaS de planes de alimentación personalizados con Inteligencia Artificial**

Diseñada para el mercado peruano · Generación de planes de 30 días en segundos

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase Auth](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase)](https://supabase.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-CapRover-336791?logo=postgresql)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-v5-2D3748?logo=prisma)](https://www.prisma.io)
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
| Base de datos | PostgreSQL propio en CapRover (vía Prisma v5) |
| ORM | Prisma v5 |
| IA | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Pagos | Culqi (pasarela peruana) |
| Emails | Resend + React Email |
| Estado | Zustand |
| Validación | Zod + React Hook Form |
| Fuentes | Inter + Plus Jakarta Sans |

> **Nota de arquitectura:** Supabase se usa **solo para autenticación** (Auth). Todos los datos de la aplicación (perfiles, suscripciones, planes de dieta) se almacenan en una instancia PostgreSQL propia desplegada en CapRover, accedida vía Prisma. Esto evita dependencia del plan de pago de Supabase.

---

## Requisitos previos

- Node.js 18+
- npm / yarn / pnpm
- Cuenta en [Supabase](https://supabase.com) (solo para Auth)
- Instancia PostgreSQL accesible (local o servidor)
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
# ─── SUPABASE (solo Auth) ────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# ─── DATABASE (PostgreSQL propio) ────────────────────────────
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_bd"

# ─── ANTHROPIC CLAUDE API ────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ─── RESEND (emails transaccionales) ─────────────────────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=NutriIA <hola@tudominio.com>

# ─── CULQI (pasarela de pagos Perú) ──────────────────────────
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_live_...
CULQI_PRIVATE_KEY=sk_live_...
CULQI_WEBHOOK_SECRET=...

# ─── APP ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NutriIA
```

### 4. Crear las tablas en la base de datos

Prisma crea automáticamente las tablas en tu base de datos con:

```bash
npx prisma db push
```

Esto crea las 4 tablas principales:
- `profiles` — datos del usuario
- `subscriptions` — suscripciones y pagos
- `user_health_profiles` — perfil de salud para generar el plan
- `diet_plans` — planes de dieta generados por IA

Para explorar la base de datos visualmente:

```bash
npx prisma studio
```

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
│       ├── auth/           # callback + status
│       ├── payments/       # Culqi: confirm, webhook
│       └── diet/           # Generación IA con Claude
├── components/
│   ├── auth/               # RegisterForm, LoginForm
│   ├── dashboard/          # OnboardingWizard, DietPlanView, etc.
│   ├── landing/            # Hero, Benefits, Pricing, FAQ, etc.
│   └── shared/             # Navbar, Footer, CulqiCheckout
├── emails/                 # Plantillas React Email
├── lib/
│   ├── supabase/           # Clientes browser y server (Auth only)
│   ├── prisma/             # Cliente Prisma singleton
│   ├── claude/             # Generador de planes con IA
│   ├── culqi/              # Cliente de pagos Culqi
│   ├── resend/             # Mailer centralizado
│   ├── stores/             # Zustand stores
│   └── validations/        # Schemas Zod
├── prisma/
│   └── schema.prisma       # Modelos de base de datos
└── types/
    └── database.ts         # Tipos TypeScript + constante PLANS
```

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
npx prisma db push   # Sincronizar schema con la base de datos
npx prisma studio    # GUI para explorar la BD
npx prisma generate  # Regenerar cliente Prisma
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
5. Asegúrate de que `DATABASE_URL` apunte a tu base de datos accesible desde Vercel

```bash
NEXT_PUBLIC_APP_URL=https://nutriia.pe
DATABASE_URL=postgresql://usuario:contraseña@host:5432/bd
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
