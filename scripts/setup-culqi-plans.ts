/**
 * Setup idempotente de los planes de Culqi para KODA.
 *
 * Lee la lista actual de planes filtrando por metadata.koda_plan_id.
 * Si el plan ya existe en Culqi → reutiliza el ID.
 * Si no existe → lo crea con los datos definidos en lib/culqi/plans.ts.
 *
 * Imprime al final un bloque listo para pegar en .env / CapRover:
 *   CULQI_PLAN_ID_INICIO=pln_test_xxxxxxxx
 *   CULQI_PLAN_ID_CORE=pln_test_xxxxxxxx
 *   CULQI_PLAN_ID_PRO=pln_test_xxxxxxxx
 *
 * Uso:
 *   CULQI_PRIVATE_KEY=sk_test_xxx npx tsx scripts/setup-culqi-plans.ts
 *
 * También funciona con sk_live_ — los planes son por ambiente,
 * así que vas a tener IDs distintos para test y para live.
 */
import { createCulqiPlan, listCulqiPlans } from '../lib/culqi/client';
import { getCulqiPlanPayload } from '../lib/culqi/plans';
import type { PlanId } from '../types/database';

const PLAN_IDS: PlanId[] = ['inicio', 'core', 'pro'];

async function setupPlan(planId: PlanId): Promise<{ planId: PlanId; culqiId: string; created: boolean }> {
  const payload = getCulqiPlanPayload(planId);

  // 1. Buscar si ya existe (filtrando por nuestro metadata.koda_plan_id)
  console.log(`\n── Plan: ${planId} (${payload.name}) ──`);
  console.log(`  Buscando en Culqi por metadata.koda_plan_id = "${planId}"...`);
  const existing = await listCulqiPlans({
    metadata: { koda_plan_id: planId },
    limit: 5,
  });

  if (existing.object_error) {
    throw new Error(
      `  ✗ Error listando planes: ${existing.user_message ?? existing.merchant_message ?? 'desconocido'}`
    );
  }

  const found = (existing.data ?? []).find(
    (p) => p.metadata?.koda_plan_id === planId
  );

  if (found?.id) {
    console.log(`  ✓ Ya existe: ${found.id}`);
    return { planId, culqiId: found.id, created: false };
  }

  // 2. No existe: crear
  console.log(`  Creando plan en Culqi...`);
  const created = await createCulqiPlan(payload);

  if (created.object_error || !created.id) {
    throw new Error(
      `  ✗ Error creando plan: ${created.user_message ?? created.merchant_message ?? JSON.stringify(created)}`
    );
  }

  console.log(`  ✓ Creado: ${created.id}`);
  return { planId, culqiId: created.id, created: true };
}

async function main() {
  if (!process.env.CULQI_PRIVATE_KEY) {
    console.error('✗ CULQI_PRIVATE_KEY no está configurada en el entorno.');
    console.error('  Usá: CULQI_PRIVATE_KEY=sk_test_xxx npx tsx scripts/setup-culqi-plans.ts');
    process.exit(1);
  }

  const isLive = process.env.CULQI_PRIVATE_KEY.startsWith('sk_live_');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Culqi Plans Setup — Ambiente: ${isLive ? 'LIVE ⚠️' : 'SANDBOX'}`);
  console.log('═══════════════════════════════════════════════════════');

  const results = [];
  for (const planId of PLAN_IDS) {
    try {
      results.push(await setupPlan(planId));
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Resumen');
  console.log('═══════════════════════════════════════════════════════');
  for (const r of results) {
    console.log(`  ${r.planId.padEnd(8)} → ${r.culqiId} ${r.created ? '(nuevo)' : '(ya existía)'}`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Configurá estas variables en .env / CapRover:');
  console.log('═══════════════════════════════════════════════════════');
  for (const r of results) {
    console.log(`CULQI_PLAN_ID_${r.planId.toUpperCase()}=${r.culqiId}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
