// ============================================================
// Cliente server-side para la API de Culqi (v2).
// Cubre:
//   • Charges (legacy, cargo único)
//   • Customers, Cards, Plans, Subscriptions (suscripciones recurrentes)
//   • Verificación de firma de webhook
//
// Convenciones:
//   - Llave secreta vía process.env.CULQI_PRIVATE_KEY (sk_test_* o sk_live_*)
//   - Todas las funciones devuelven un objeto que puede contener `object_error`
//     cuando Culqi rechaza la operación. El caller debe inspeccionar.
//   - Errores de red levantan excepción.
// ============================================================

const API_BASE = 'https://api.culqi.com/v2';

/** Posibles campos de error que devuelve Culqi cuando la operación falla. */
export interface CulqiErrorEnvelope {
  object_error?: string;
  type?: string;
  merchant_message?: string;
  user_message?: string;
  code?: string;
  decline_code?: string;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function getSecretKey(): string {
  const key = process.env.CULQI_PRIVATE_KEY;
  if (!key) throw new Error('CULQI_PRIVATE_KEY no configurado');
  return key;
}

async function culqiRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T & CulqiErrorEnvelope> {
  const url = `${API_BASE}${path}`;
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getSecretKey()}`,
    },
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(url, init);

  // Capturamos el body como texto primero para poder diagnosticar
  // respuestas no-JSON (HTML de error, body vacío en 4xx/5xx, etc.).
  const text = await res.text();

  // Headers útiles para diagnóstico (request id, content-type).
  const reqId =
    res.headers.get('x-request-id') ?? res.headers.get('request-id') ?? '';
  const contentType = res.headers.get('content-type') ?? '';

  if (!text) {
    return {
      object_error: 'http_error',
      type: String(res.status),
      merchant_message: `Culqi devolvió HTTP ${res.status} sin body (${method} ${url}${reqId ? ' req=' + reqId : ''} content-type=${contentType || 'none'})`,
      user_message: `Error en la integración con Culqi (HTTP ${res.status}).`,
    } as T & CulqiErrorEnvelope;
  }
  try {
    return JSON.parse(text) as T & CulqiErrorEnvelope;
  } catch {
    return {
      object_error: 'parse_error',
      type: String(res.status),
      merchant_message: `Culqi devolvió respuesta no-JSON (HTTP ${res.status}, ${url}): ${text.slice(0, 200)}`,
      user_message: 'Respuesta inesperada de Culqi. Inténtalo de nuevo.',
    } as T & CulqiErrorEnvelope;
  }
}

// ────────────────────────────────────────────────────────────
// CHARGES (legacy — cargo único)
// ────────────────────────────────────────────────────────────

interface CulqiChargeParams {
  amount: number; // céntimos PEN
  currency_code: 'PEN';
  email: string;
  source_id: string; // toks_xxx
  description?: string;
}

interface CulqiChargeResponse extends CulqiErrorEnvelope {
  id?: string;
  object?: string;
  amount?: number;
  currency_code?: string;
  email?: string;
  source?: { id: string };
}

/**
 * Crea un cargo único (one-time). Mantenido para compatibilidad con
 * el flujo actual; las suscripciones recurrentes usan la pipeline
 * customers → cards → subscriptions.
 *
 * Usa el host legacy `secure.culqi.com` por compatibilidad histórica.
 */
export async function createCulqiCharge(
  params: CulqiChargeParams
): Promise<CulqiChargeResponse> {
  const response = await fetch('https://secure.culqi.com/v2/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getSecretKey()}`,
    },
    body: JSON.stringify(params),
  });
  return (await response.json()) as CulqiChargeResponse;
}

// ────────────────────────────────────────────────────────────
// CUSTOMERS
// ────────────────────────────────────────────────────────────

export interface CulqiCustomerInput {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  address_city: string;
  country_code: string; // ISO 3166-1 alpha-2, ej. "PE"
  phone_number: string;
  metadata?: Record<string, string>;
}

export interface CulqiCustomerResponse extends CulqiErrorEnvelope {
  id?: string; // cus_xxx
  object?: 'customer';
  email?: string;
  first_name?: string;
  last_name?: string;
  cards?: Array<{ id: string }>;
}

export async function createCulqiCustomer(
  input: CulqiCustomerInput
): Promise<CulqiCustomerResponse> {
  return culqiRequest<CulqiCustomerResponse>('POST', '/customers', input);
}

// ────────────────────────────────────────────────────────────
// CARDS
// ────────────────────────────────────────────────────────────

export interface CulqiCardInput {
  customer_id: string; // cus_xxx
  token_id: string; // toks_xxx (creado por Culqi.js en el front)
  validate?: boolean; // valida la tarjeta con un cargo de 1 sol que se reversa
  metadata?: Record<string, string>;
}

export interface CulqiCardResponse extends CulqiErrorEnvelope {
  id?: string; // card_xxx
  object?: 'card';
  customer_id?: string;
  source?: { id: string };
}

export async function createCulqiCard(
  input: CulqiCardInput
): Promise<CulqiCardResponse> {
  return culqiRequest<CulqiCardResponse>('POST', '/cards', input);
}

// ────────────────────────────────────────────────────────────
// PLANS
// ────────────────────────────────────────────────────────────

export interface CulqiPlanInput {
  name: string;
  short_name?: string;
  description?: string;
  amount: number; // céntimos
  currency: 'PEN';
  interval_unit_time: 1 | 2 | 3 | 4; // 1=día 2=semana 3=mes 4=año
  interval_count: number;
  limit: number; // 0 = sin límite
  metadata?: Record<string, string>;
}

export interface CulqiPlanResponse extends CulqiErrorEnvelope {
  id?: string; // pln_xxx
  object?: 'plan';
  name?: string;
  short_name?: string;
  amount?: number;
  currency?: string;
  interval?: string;
  metadata?: Record<string, string>;
}

export async function createCulqiPlan(
  input: CulqiPlanInput
): Promise<CulqiPlanResponse> {
  return culqiRequest<CulqiPlanResponse>('POST', '/plans', input);
}

export interface CulqiPlanListResponse extends CulqiErrorEnvelope {
  data?: Array<CulqiPlanResponse>;
  paging?: { cursors?: { before?: string; after?: string }; remaining_items?: number };
}

export async function listCulqiPlans(
  params: { limit?: number; before?: string; after?: string } = {}
): Promise<CulqiPlanListResponse> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.before) query.set('before', params.before);
  if (params.after) query.set('after', params.after);
  const qs = query.toString();
  return culqiRequest<CulqiPlanListResponse>('GET', `/plans${qs ? '?' + qs : ''}`);
}

// ────────────────────────────────────────────────────────────
// SUBSCRIPTIONS
// ────────────────────────────────────────────────────────────

export interface CulqiSubscriptionInput {
  card_id: string; // card_xxx
  plan_id: string; // pln_xxx
  metadata?: Record<string, string>;
}

export interface CulqiSubscriptionResponse extends CulqiErrorEnvelope {
  id?: string; // sub_xxx
  object?: 'subscription';
  status?: string; // 'active' | 'cancelled' | 'expired' | etc.
  plan_id?: string;
  card_id?: string;
  current_period_start?: number; // unix timestamp (ms)
  current_period_end?: number;
  next_billing_date?: number;
  creation_date?: number;
  metadata?: Record<string, string>;
}

export async function createCulqiSubscription(
  input: CulqiSubscriptionInput
): Promise<CulqiSubscriptionResponse> {
  return culqiRequest<CulqiSubscriptionResponse>('POST', '/subscriptions', input);
}

export async function getCulqiSubscription(
  subscriptionId: string
): Promise<CulqiSubscriptionResponse> {
  return culqiRequest<CulqiSubscriptionResponse>(
    'GET',
    `/subscriptions/${subscriptionId}`
  );
}

export async function cancelCulqiSubscription(
  subscriptionId: string
): Promise<CulqiSubscriptionResponse> {
  return culqiRequest<CulqiSubscriptionResponse>(
    'DELETE',
    `/subscriptions/${subscriptionId}`
  );
}

// ────────────────────────────────────────────────────────────
// WEBHOOK SIGNATURE
// ────────────────────────────────────────────────────────────

/**
 * Verifica la firma HMAC-SHA256 del webhook de Culqi.
 * Culqi envía el header 'x-culqi-signature' con la firma del body en hex.
 */
export async function verifyCulqiWebhookSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  const secret = process.env.CULQI_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigBytes = Uint8Array.from(
    signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  );

  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody));
}
