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
  { label: 'GET /v2/plans (api.culqi.com, sin params)', method: 'GET', url: 'https://api.culqi.com/v2/plans' },
  { label: 'GET /v2/plans?limit=10 (api.culqi.com)', method: 'GET', url: 'https://api.culqi.com/v2/plans?limit=10' },
  { label: 'GET /v2/plans (secure.culqi.com)', method: 'GET', url: 'https://secure.culqi.com/v2/plans' },
  { label: 'GET /v2/customers (api.culqi.com, sin params)', method: 'GET', url: 'https://api.culqi.com/v2/customers' },
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
