# Plan de Implementacion - NutriIA

## Contexto
Plataforma SaaS de planes de dieta personalizados con IA para el mercado peruano. Proyecto Next.js 14 fresco — solo tiene archivos por defecto. Se desarrollara en 8 modulos secuenciales con confirmacion entre cada uno.

## Skills Disponibles
**Ya instalados:** shadcn, react-hook-form, zustand, tailwind-css-patterns, claude-api, ui-design-system, vercel-react-best-practices, typescript-advanced-types
**Recien descargados:** nextjs-supabase-auth, react-email (oficial Resend), resend-skills, react-pdf, zod-schema-validation

---

## MODULO 1 — Setup y Fundacion

### 1.1 Instalar dependencias
```bash
npx shadcn@latest init  # style=default, CSS-variables=yes
npx shadcn@latest add button card input label form select textarea tabs badge progress skeleton toast dialog sheet separator accordion

npm install @supabase/supabase-js @supabase/ssr
npm install @anthropic-ai/sdk
npm install resend @react-email/components @react-email/render
npm install react-hook-form @hookform/resolvers zod
npm install zustand lucide-react @react-pdf/renderer date-fns
npm install clsx tailwind-merge sonner next-themes tailwindcss-animate
```

### 1.2 Configurar theming
- **`tailwind.config.ts`** — Reemplazar con config completa: `darkMode: ['class']`, colores HSL de shadcn, colores `macro` (protein/carbs/fat/calories), colores `sidebar`, fuentes sans (Inter) y display (Plus Jakarta Sans), plugin `tailwindcss-animate`
- **`app/globals.css`** — Reemplazar con variables CSS completas: `:root` (modo claro, verde primario `142 76% 36%`, naranja accent `24 95% 53%`) y `.dark` (modo oscuro)

### 1.3 Configurar layout.tsx
- Fuentes: `Plus_Jakarta_Sans` + `Inter` desde `next/font/google`
- `<html lang="es" suppressHydrationWarning>`
- Envolver con `ThemeProvider` de next-themes
- Agregar `<Toaster />` de sonner
- Metadata: "NutriIA - Plan de Dieta Personalizado con IA"

### 1.4 Clientes Supabase
- **`lib/supabase/client.ts`** — Browser client con `createBrowserClient` de `@supabase/ssr`
- **`lib/supabase/server.ts`** — Server client con `createServerClient`, cookies de `next/headers`, try/catch en set/remove para Server Components

### 1.5 Middleware de rutas
- **`middleware.ts`** — Supabase client con `NextRequest`/`NextResponse`, `getUser()`, proteger `/dashboard/*`, `/onboarding`, `/mi-plan/*`, `/historial/*`, `/perfil/*`, `/suscripcion/*`. Sin sesion → `/auth/login?redirectTo=...`

### 1.6 Tipos TypeScript
- **`types/database.ts`** — Interfaces: `Profile`, `Subscription`, `UserHealthProfile`, `DietPlan`, `DietPlanData` (estructura anidada del JSON de Claude), tipo `Database` para generico de Supabase, constante `PLANS` con los 3 planes

### 1.7 Estructura de carpetas
- Crear route groups: `app/(public)/`, `app/(dashboard)/`
- Crear: `app/onboarding/`, `app/api/auth/callback/`, `app/api/payments/`, `app/api/diet/`, `app/api/emails/`
- Crear: `components/landing/`, `components/auth/`, `components/dashboard/`, `components/shared/`, `emails/`
- Crear: `lib/supabase/`, `lib/claude/`, `lib/culqi/`, `lib/resend/`, `lib/validations/`
- Mover `app/page.tsx` → `app/(public)/page.tsx`
- Crear `.env.local.example` con las 10 variables de entorno

**Archivos a crear/modificar:** ~12 archivos

---

## MODULO 2 — Autenticacion Completa

### 2.1 Schemas de validacion
- **`lib/validations/auth.ts`** — `registerSchema` (full_name min 2, email, password: min 8 + 1 mayuscula + 1 numero), `loginSchema`

### 2.2 Paginas de auth
- **`app/(public)/auth/register/page.tsx`** + **`components/auth/RegisterForm.tsx`** — React Hook Form + Zod, `signUp()` con `data: { full_name }`, redirect a `/auth/verify-email`, spinner en submit
- **`app/(public)/auth/login/page.tsx`** + **`components/auth/LoginForm.tsx`** — `signInWithPassword()`, si email no verificado → alerta + boton reenviar, routing post-login (sin health_profile + sub activa → `/onboarding`, con health_profile → `/dashboard`, sin sub → `/planes`)
- **`app/(public)/auth/verify-email/page.tsx`** — Pagina estatica con icono Mail, boton "Reenviar correo"
- **`app/api/auth/callback/route.ts`** — `exchangeCodeForSession(code)`, redirect segun estado del usuario

### 2.3 Extras
- Forgot password via `resetPasswordForEmail()` desde LoginForm
- Logout reutilizable: `signOut()` + redirect a `/`

**Archivos a crear:** ~8 archivos

---

## MODULO 3 — Landing Page

### 3.1 Layout publico
- **`app/(public)/layout.tsx`** — Navbar + children + Footer

### 3.2 Componentes compartidos
- **`components/shared/Navbar.tsx`** — Logo NutriIA (Leaf icon), links smooth scroll, ThemeToggle, CTAs login/register, hamburger mobile con Sheet
- **`components/shared/ThemeToggle.tsx`** — `useTheme()` de next-themes, Sun/Moon toggle
- **`components/shared/Footer.tsx`** — Logo, links, legal, copyright

### 3.3 Secciones landing (7 componentes)
- **`components/landing/Hero.tsx`** — "Tu plan de alimentacion personalizado con IA", 2 CTAs
- **`components/landing/Benefits.tsx`** — 6 cards con iconos Lucide, grid responsive
- **`components/landing/HowItWorks.tsx`** — 3 pasos numerados con conectores
- **`components/landing/Testimonials.tsx`** — 3 cards con nombres peruanos
- **`components/landing/Pricing.tsx`** — 3 cards usando constante `PLANS`, Estandar destacado con Badge "Mas popular"
- **`components/landing/FAQ.tsx`** — 8 preguntas en Accordion de shadcn
- **`components/landing/CTABanner.tsx`** — Seccion urgencia con fondo primary

- **`app/(public)/page.tsx`** — Compone todas las secciones

**Archivos a crear:** ~11 archivos

---

## MODULO 4 — Pagos con Culqi

### 4.1 Cliente Culqi
- **`lib/culqi/client.ts`** — Funciones server-side: `createCulqiCharge()` con fetch a API Culqi
- **`lib/validations/payment.ts`** — Schemas Zod para requests y webhooks

### 4.2 Componente checkout
- **`components/shared/CulqiCheckout.tsx`** — Carga script Culqi.js, configura checkout, escucha token, POST a `/api/payments/confirm`

### 4.3 API routes
- **`app/api/payments/create-order/route.ts`** — Valida plan_id, verifica sesion, retorna datos de orden
- **`app/api/payments/confirm/route.ts`** — Recibe token Culqi, crea cargo, inserta en `subscriptions` (service role), envia email confirmacion
- **`app/api/payments/webhook/route.ts`** — Verifica HMAC, actualiza status de suscripcion

### 4.4 Pagina de precios standalone
- **`app/(public)/planes/page.tsx`** — Pricing + CulqiCheckout, si logueado abre checkout, si no → register

**Archivos a crear:** ~7 archivos

---

## MODULO 5 — Emails con Resend + React Email

### 5.1 Mailer centralizado
- **`lib/resend/mailer.ts`** — Cliente Resend, 4 funciones exportadas: `sendWelcomeEmail`, `sendPaymentConfirmationEmail`, `sendDietPlanReadyEmail`, `sendRenewalReminderEmail`. Non-blocking (try/catch, log errores)

### 5.2 Plantillas (5 templates)
- **`emails/WelcomeEmail.tsx`** — Bienvenida + 3 pasos + CTA "Ver planes"
- **`emails/PaymentConfirmationEmail.tsx`** — Plan, monto en soles, CTA "Completar mi perfil"
- **`emails/DietPlanReadyEmail.tsx`** — Resumen macros, CTA "Ver mi plan"
- **`emails/SubscriptionRenewalEmail.tsx`** — Fecha renovacion, monto, CTA "Gestionar suscripcion"
- **`emails/PasswordResetEmail.tsx`** — Instrucciones + link reset

### 5.3 Integracion en triggers existentes
- Welcome → `/api/auth/callback`
- Payment → `/api/payments/confirm`
- Diet ready → `/api/diet/generate`
- Renewal → futuro cron job

**Archivos a crear:** ~7 archivos

---

## MODULO 6 — Onboarding + Generacion IA

### 6.1 Validaciones
- **`lib/validations/health-profile.ts`** — 3 schemas por paso + `fullHealthProfileSchema` merged

### 6.2 Wizard de onboarding
- **`app/onboarding/page.tsx`** — Server: verificar sub activa + no health_profile existente
- **`components/dashboard/OnboardingWizard.tsx`** — 3 pasos con barra progreso:
  - Paso 1: edad, peso (kg), estatura (cm)
  - Paso 2: objetivo, nivel actividad (selects)
  - Paso 3: alimentos preferidos/evitados/alergias (tag inputs con chips sugeridos de comida peruana), condiciones medicas
  - Submit → guardar health_profile → llamar generate → loading screen → redirect a `/mi-plan`

### 6.3 Generacion con Claude API
- **`lib/claude/diet-generator.ts`** — `generateDietPlan()`: calcula BMI, construye prompt con datos usuario, llama `claude-sonnet-4-20250514` con max_tokens 8000, parsea JSON, 1 retry si falla parse
- **`app/api/diet/generate/route.ts`** — Verifica sesion, obtiene health_profile, verifica limite de generaciones del plan, llama generador, guarda en `diet_plans`, envia email, retorna exito

### 6.4 Pantalla de carga
- Animacion CSS (plato pulsante/utensilios girando) con "Generando tu plan personalizado..."
- Llamada directa al API desde el cliente (timeout 120s), sin polling
- On success → redirect `/mi-plan` con toast Sonner

**Archivos a crear:** ~5 archivos

---

## MODULO 7 — Panel de Usuario

### 7.1 Layout dashboard
- **`app/(dashboard)/layout.tsx`** — Verificar sesion, fetch profile, renderizar Sidebar + contenido
- **`components/dashboard/Sidebar.tsx`** — Nav items con iconos Lucide (Dashboard, Mi Plan, Historial, Perfil, Suscripcion), activo segun `usePathname()`, colapsable en mobile con Sheet, ThemeToggle, logout

### 7.2 Paginas
- **`app/(dashboard)/dashboard/page.tsx`** — Saludo con hora del dia, resumen suscripcion, macros del dia, acciones rapidas
- **`app/(dashboard)/mi-plan/page.tsx`** + **`components/dashboard/DietPlanView.tsx`** — Tabs por semana, dias con Accordion de 5 comidas, barras de progreso macros, lista compras, boton PDF
- **`components/dashboard/MacroProgressBar.tsx`** — Barra reutilizable con colores macro
- **`components/dashboard/ShoppingList.tsx`** — Checklist de ingredientes semanales
- **`components/dashboard/PdfDownloadButton.tsx`** — `@react-pdf/renderer` lazy-loaded, genera PDF del plan
- **`app/(dashboard)/historial/page.tsx`** — Grid de planes anteriores por mes/ano
- **`app/(dashboard)/perfil/page.tsx`** + **`components/dashboard/HealthProfileForm.tsx`** — Formulario editable + boton "Regenerar plan"
- **`app/(dashboard)/suscripcion/page.tsx`** — Estado, fechas, cancelar con Dialog confirmacion

### 7.3 Zustand store
- **`lib/stores/user-store.ts`** — `user`, `subscription`, `sidebarOpen` + acciones

**Archivos a crear:** ~12 archivos

---

## MODULO 8 — Pulido y Deploy

### 8.1 Loading states
- `loading.tsx` en cada ruta del dashboard con Skeletons

### 8.2 Error handling
- `app/error.tsx` — Error boundary global
- `app/not-found.tsx` — 404 personalizado
- `app/(dashboard)/error.tsx` — Error boundary dashboard

### 8.3 SEO
- Metadata en cada pagina, `robots: { index: false }` en dashboard
- `app/sitemap.ts` y `app/robots.ts`

### 8.4 Responsive
- Revision completa en 375px, 768px, 1280px

### 8.5 Deploy
- `next.config.mjs` — Configuraciones necesarias
- `vercel.json` — Cron para recordatorio de renovacion
- **`app/api/cron/renewal-reminder/route.ts`** — Query suscripciones por vencer en 5 dias, enviar emails

**Archivos a crear:** ~8 archivos

---

## Resumen Total
- **~70 archivos** a crear/modificar a lo largo de los 8 modulos
- **Orden estricto:** M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8
- **Confirmacion** del usuario requerida al finalizar cada modulo

## Verificacion por Modulo
1. **M1:** `npm run dev` compila sin errores, tema claro/oscuro funciona
2. **M2:** Registro, verificacion email, login, logout, proteccion de rutas — todo el flujo end-to-end
3. **M3:** Landing visible en `/`, todas las secciones renderizan, responsive, links funcionan
4. **M4:** Checkout Culqi abre con sandbox keys, pago crea suscripcion en BD
5. **M5:** Emails se envian correctamente (verificar en Resend dashboard)
6. **M6:** Wizard completo, Claude genera plan, se guarda en BD, redirect a mi-plan
7. **M7:** Todas las paginas del dashboard cargan datos reales, PDF se descarga
8. **M8:** Build exitoso, lighthouse check, deploy en Vercel

## Riesgos Clave
1. **Parsing JSON de Claude** — Plan de 30 dias es ~8000 tokens. Mitigacion: strip code fences, retry 1x, validar con Zod
2. **Culqi.js** — Sin tipos TS nativos. Mitigacion: declarar tipos globales manualmente, usar sandbox
3. **Cookies SSR Supabase** — Patron diferente en middleware vs server components vs route handlers. Mitigacion: seguir guia oficial exactamente
4. **PDF client-side** — `@react-pdf/renderer` es pesado. Mitigacion: lazy-load con dynamic import
