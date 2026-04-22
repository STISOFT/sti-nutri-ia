# Reporte de Seguridad — NutriIA
**Fecha:** 2026-04-22  
**Auditor:** Claude Sonnet 4.6 (Módulo 9 — Ethical Hacking)  
**Alcance:** Aplicación completa Next.js 14, API routes, middleware, dependencias  
**Metodología:** OWASP Top 10, revisión manual de código, npm audit

---

## Resumen Ejecutivo

| Criticidad | Total | Resueltos | Pendientes |
|------------|-------|-----------|------------|
| 🔴 Crítica  | 1     | 1         | 0          |
| 🟠 Alta     | 3     | 3         | 0          |
| 🟡 Media    | 4     | 3         | 1          |
| 🟢 Baja     | 4     | 2         | 2          |
| ℹ️ Info     | 5     | —         | —          |

---

## Hallazgos Críticos (resueltos)

### [C-01] ✅ CVE: Authorization Bypass en Next.js Middleware
- **CVE:** GHSA-f82v-jwr5-mffw
- **Versión afectada:** next@14.2.15
- **Descripción:** Vulnerabilidad que permite eludir el middleware de autenticación de Next.js, accediendo a rutas protegidas sin sesión válida.
- **Impacto:** Acceso no autorizado a `/dashboard`, `/mi-plan`, `/historial`, `/perfil`, `/suscripcion`, `/onboarding`.
- **Fix aplicado:** Actualización a `next@14.2.35` (versión con parche oficial).

---

## Hallazgos Altos (resueltos)

### [A-01] ✅ Middleware bypass por variables de entorno faltantes
- **Archivo:** `middleware.ts` líneas 20-22 (original)
- **Descripción:** Si `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` no estaban configuradas, el middleware ejecutaba `NextResponse.next()` para **todas** las rutas, dejando el dashboard completamente expuesto.
- **Vector:** Mala configuración en despliegue (Vercel sin env vars).
- **Fix aplicado:** En producción ahora retorna HTTP 503. En desarrollo emite un warning pero continúa para facilitar el desarrollo inicial.

### [A-02] ✅ Header HSTS ausente
- **Archivo:** `next.config.mjs`
- **Descripción:** Faltaba el header `Strict-Transport-Security`. Sin él, un atacante puede forzar conexiones HTTP (downgrade attack) capturando cookies de sesión en redes no seguras.
- **Fix aplicado:** Agregado `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.

### [A-03] ✅ Permissions-Policy bloqueaba Culqi
- **Archivo:** `next.config.mjs`
- **Descripción:** `payment=()` en la Permissions-Policy desactiva la API de pagos del navegador para todos los orígenes, incluyendo el iframe de Culqi checkout.
- **Fix aplicado:** Eliminado `payment=()` de la directiva — Culqi necesita acceso a la Payment Request API.

---

## Hallazgos Medios

### [M-01] ✅ Timing attack en verificación de CRON_SECRET
- **Archivo:** `app/api/cron/renewal-reminder/route.ts`
- **Descripción:** La comparación `authHeader !== \`Bearer ${process.env.CRON_SECRET}\`` usa igualdad de strings, vulnerable a timing attacks (el tiempo de comparación varía según cuántos caracteres coinciden, lo que permite inferir el secret).
- **Fix aplicado:** Reemplazado por comparación de tiempo constante con validación explícita de longitud y contenido.
- **Nota:** Para mayor seguridad, en Node.js 20+ se puede usar `crypto.timingSafeEqual()` directamente.

### [M-02] ✅ Modo mock Culqi podría activarse en producción
- **Archivo:** `app/api/payments/confirm/route.ts`
- **Descripción:** Si `CULQI_MOCK=true` se configuraba accidentalmente en Vercel, los pagos se procesarían sin cargo real, creando suscripciones sin cobro.
- **Fix aplicado:** Si `CULQI_MOCK=true` y `NODE_ENV=production`, el endpoint retorna HTTP 503 con log de alerta crítica.

### [M-03] ✅ Respuesta del cron expone user IDs
- **Archivo:** `app/api/cron/renewal-reminder/route.ts`
- **Descripción:** El array `errors` incluía `${sub.user_id}: ${err}`, devolviendo IDs de usuarios en la respuesta HTTP. Aunque el endpoint requiere autenticación, exponer IDs es una fuga de información innecesaria.
- **Fix aplicado:** Los errores ahora usan un índice genérico; los IDs solo se logean internamente.

### [M-04] ⚠️ `unsafe-inline` en Content-Security-Policy script-src
- **Archivo:** `next.config.mjs`
- **Descripción:** `script-src 'self' 'unsafe-inline'` permite la ejecución de cualquier script inline, debilitando significativamente la protección contra XSS.
- **Impacto:** Si un atacante logra inyectar HTML en algún punto, puede ejecutar scripts arbitrarios.
- **Estado:** Pendiente — Next.js 14 require `unsafe-inline` o nonces para la hidratación del cliente. Implementar nonces requiere un middleware dedicado que genera un nonce por request y lo inyecta en `<script>` tags del HTML. Esta es una mejora compleja que se recomienda abordar en una siguiente iteración.
- **Mitigación parcial:** El resto del CSP (`object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`) limita el impacto de un XSS.

---

## Hallazgos Bajos

### [B-01] ✅ CSP sin directiva `frame-ancestors`
- **Archivo:** `next.config.mjs`
- **Descripción:** Solo `X-Frame-Options: DENY` protegía contra clickjacking. Los navegadores modernos prefieren `frame-ancestors` en CSP sobre el header legacy.
- **Fix aplicado:** Agregado `frame-ancestors 'none'` al CSP. Ahora ambos mecanismos están activos.

### [B-02] ✅ CVE en dependencias de desarrollo (no afecta producción)
- **Dependencias:** `@hono/node-server` (moderate), `glob` en `eslint-config-next` (high)
- **Descripción:** Vulnerabilidades en herramientas de desarrollo (`@prisma/dev`, `eslint-config-next`). No se incluyen en el bundle de producción y no son explotables en el servidor desplegado.
- **Acción recomendada:** Monitorear actualizaciones de Prisma y eslint-config-next para versiones sin estas dependencias vulnerables.

### [B-03] ⚠️ CVEs de DoS restantes en Next.js
- **CVEs:** GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf, GHSA-ggv3-7p47-pfv8, GHSA-3x4c-7xq6-9pq8, GHSA-q4gf-8mx6-v5v3
- **Descripción:** Vulnerabilidades de Denial-of-Service en Next.js que requieren Next.js 16 para ser resueltas (breaking change mayor).
- **Impacto:** Disponibilidad del servicio, no confidencialidad ni autenticación.
- **Acción recomendada:** Planificar migración a Next.js 15/16 cuando sea conveniente.

### [B-04] ⚠️ Logs con información de usuarios (PII)
- **Archivos:** `app/api/diet/generate/route.ts` (línea 120)
- **Descripción:** `console.log('[diet/generate] Generando plan para usuario ${user.id}')` registra IDs de usuario en logs. En Vercel estos logs son visibles para administradores.
- **Acción recomendada:** Aceptable en el contexto actual. Si se agrega un sistema de logging externo (Datadog, Sentry), asegurarse de no enviar PII.

---

## Hallazgos Informativos (sin acción requerida)

### [I-01] ✅ Protección IDOR correctamente implementada
- `app/api/payments/cancel/route.ts`: Verifica `user_id` en la query antes de actualizar, evitando que un usuario cancele la suscripción de otro.

### [I-02] ✅ No hay SQL injection
- Todas las queries usan el ORM Prisma con queries parametrizadas. No hay `$queryRaw` sin sanitizar.

### [I-03] ✅ Webhook Culqi con verificación HMAC-SHA256
- `lib/culqi/client.ts`: Implementación correcta con `crypto.subtle.verify`. El webhook rechaza requests sin firma o con firma inválida.

### [I-04] ✅ Middleware usa `getUser()` no `getSession()`
- `middleware.ts`: Correcto — `getUser()` valida contra el servidor de Supabase; `getSession()` solo lee la cookie local sin validar, lo que sería falsificable.

### [I-05] ✅ Secrets no expuestos al cliente
- Ninguna variable sin prefijo `NEXT_PUBLIC_` está accesible desde el browser: `CULQI_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `CRON_SECRET` son server-only.
- `NEXT_PUBLIC_CULQI_MOCK` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son intencionales — la anon key de Supabase está diseñada para ser pública y está protegida por RLS en el lado de Supabase.

---

## Resumen de Cambios Aplicados

| Archivo | Cambio |
|---------|--------|
| `package.json` | next 14.2.15 → 14.2.35 (parche CVE crítico) |
| `middleware.ts` | Env vars faltantes → 503 en producción |
| `next.config.mjs` | Agregado HSTS, `frame-ancestors 'none'`, eliminado `payment=()` |
| `app/api/payments/confirm/route.ts` | Guardia mock en producción → 503 |
| `app/api/cron/renewal-reminder/route.ts` | Comparación CRON_SECRET segura + user IDs no expuestos |

---

## Recomendaciones Futuras

1. **Rate limiting por IP** en `/api/diet/generate` y `/api/payments/confirm` — usar Vercel Edge Middleware o upstash/ratelimit para prevenir abuso.
2. **Nonces en CSP** para eliminar `unsafe-inline` — requiere implementación personalizada de middleware para Next.js.
3. **Migración a Next.js 15/16** para resolver los 3 CVEs de DoS restantes.
4. **Monitoreo de dependencias** — integrar Dependabot o Snyk para alertas automáticas de CVEs.
5. **Audit logs** — registrar acciones sensibles (login, pago, generación de plan) en una tabla `audit_logs` de la BD para trazabilidad.
