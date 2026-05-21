import { PLANS, type PlanId } from '@/types/database';
import type { CulqiPlanInput } from '@/lib/culqi/client';

// ============================================================
// Mapeo entre nuestros plan_id internos (inicio/core/pro) y
// los IDs de plan persistidos en Culqi (pln_xxx).
//
// Los IDs de Culqi se obtienen al ejecutar:
//   npx tsx scripts/setup-culqi-plans.ts
// y se guardan en variables de entorno:
//   CULQI_PLAN_ID_INICIO=pln_test_xxxxxxxxxxxxxxxx
//   CULQI_PLAN_ID_CORE=pln_test_xxxxxxxxxxxxxxxx
//   CULQI_PLAN_ID_PRO=pln_test_xxxxxxxxxxxxxxxx
// ============================================================

const ENV_KEY_BY_PLAN: Record<PlanId, string> = {
  inicio: 'CULQI_PLAN_ID_INICIO',
  core: 'CULQI_PLAN_ID_CORE',
  pro: 'CULQI_PLAN_ID_PRO',
};

/**
 * Devuelve el ID de plan Culqi (pln_xxx) configurado para el
 * plan_id interno. Tira un Error claro si la env var no está
 * configurada — útil para detectar misconfiguración en deploy.
 */
export function getCulqiPlanId(planId: PlanId): string {
  const envKey = ENV_KEY_BY_PLAN[planId];
  const culqiId = process.env[envKey];
  if (!culqiId) {
    throw new Error(
      `${envKey} no configurado. Ejecutá "npx tsx scripts/setup-culqi-plans.ts" para generarlo y configuralo en .env / CapRover.`
    );
  }
  return culqiId;
}

/**
 * Devuelve metadata del plan Culqi: nombre, monto, periodicidad.
 * Usado por el script de setup para crear los planes en Culqi
 * con los valores correctos.
 */
export function getCulqiPlanPayload(planId: PlanId): CulqiPlanInput {
  const plan = PLANS[planId];
  return {
    name: plan.name,
    short_name: planId,
    description: plan.subtitle,
    amount: plan.price_cents, // céntimos PEN
    currency: 'PEN',
    // Suscripción mensual:
    interval_unit_time: 3, // 1=día, 2=semana, 3=mes, 4=año (Culqi)
    interval_count: 1,
    // Sin límite de cobros (suscripción continua hasta cancelar):
    limit: 0,
    metadata: {
      koda_plan_id: planId,
    },
  };
}
