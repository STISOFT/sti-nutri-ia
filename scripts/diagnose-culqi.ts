/**
 * Diagnóstico de la API de Culqi para identificar URL/params correctos.
 * Prueba varias combinaciones de URL y reporta status + body de cada una.
 *
 * Uso:
 *   CULQI_PRIVATE_KEY=sk_test_xxx npx tsx scripts/diagnose-culqi.ts
 */
const KEY = process.env.CULQI_PRIVATE_KEY;
if (!KEY) {
  console.error('✗ CULQI_PRIVATE_KEY no configurada.');
  process.exit(1);
}
console.log(`Usando key: ${KEY.slice(0, 12)}... (${KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'})`);

interface Probe {
  label: string;
  method: 'GET' | 'POST';
  url: string;
  body?: unknown;
}

const probes: Probe[] = [
  // Plans (sospechoso)
  { label: 'POST /v2/plans (intentar crear uno)', method: 'POST', url: 'https://api.culqi.com/v2/plans', body: {
      name: 'KODA TEST PLAN',
      short_name: 'koda_test_diagnose',
      description: 'Plan creado por script de diagnóstico — se puede borrar',
      amount: 2990,
      currency: 'PEN',
      interval_unit_time: 3,
      interval_count: 1,
      limit: 0,
      metadata: { koda_diagnostic: 'true' },
  } },
  { label: 'GET /v2/plans/ (con trailing slash)', method: 'GET', url: 'https://api.culqi.com/v2/plans/' },
  // Otras features para comparar
  { label: 'GET /v2/subscriptions (control — otra feature recurrente)', method: 'GET', url: 'https://api.culqi.com/v2/subscriptions' },
  { label: 'GET /v2/charges (control — feature core)', method: 'GET', url: 'https://api.culqi.com/v2/charges' },
];

async function probe(p: Probe) {
  console.log(`\n── ${p.label} ──`);
  console.log(`  ${p.method} ${p.url}`);
  try {
    const init: RequestInit = {
      method: p.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KEY}`,
      },
    };
    if (p.body) init.body = JSON.stringify(p.body);

    const res = await fetch(p.url, init);
    const text = await res.text();
    const reqId = res.headers.get('x-request-id') ?? res.headers.get('request-id') ?? '—';
    const ctype = res.headers.get('content-type') ?? '—';

    console.log(`  → HTTP ${res.status}`);
    console.log(`  → content-type: ${ctype}`);
    console.log(`  → request-id: ${reqId}`);
    console.log(`  → body (${text.length} bytes):`);
    if (text.length === 0) {
      console.log('    [vacío]');
    } else {
      // Intentar parsear como JSON para print bonito
      try {
        const parsed = JSON.parse(text);
        console.log(JSON.stringify(parsed, null, 2).split('\n').map((l) => '    ' + l).join('\n'));
      } catch {
        console.log('    ' + text.slice(0, 400));
      }
    }
  } catch (err) {
    console.log(`  ✗ Excepción de red: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function main() {
  for (const p of probes) {
    await probe(p);
  }
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Compartime el output completo y vemos qué endpoint funciona.');
}

main();
