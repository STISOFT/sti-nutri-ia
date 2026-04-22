// Funciones server-side para interactuar con la API de Culqi

interface CulqiChargeParams {
  amount: number;           // en céntimos (ej: 4900 = S/49.00)
  currency_code: 'PEN';
  email: string;
  source_id: string;        // token generado por Culqi.js en el cliente
  description?: string;
}

interface CulqiChargeResponse {
  id?: string;
  object?: string;
  amount?: number;
  currency_code?: string;
  email?: string;
  source?: { id: string };
  // Error de Culqi
  object_error?: string;
  type?: string;
  merchant_message?: string;
  user_message?: string;
  code?: string;
  decline_code?: string;
}

/**
 * Crea un cargo en la API de Culqi usando el token del cliente.
 * Se llama desde el API Route /api/payments/confirm (server-side).
 */
export async function createCulqiCharge(
  params: CulqiChargeParams
): Promise<CulqiChargeResponse> {
  const secretKey = process.env.CULQI_PRIVATE_KEY;

  if (!secretKey) {
    throw new Error('CULQI_PRIVATE_KEY no configurado');
  }

  const response = await fetch('https://secure.culqi.com/v2/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify(params),
  });

  const data: CulqiChargeResponse = await response.json();
  return data;
}

/**
 * Verifica la firma HMAC-SHA256 del webhook de Culqi.
 * Culqi envía el header 'x-culqi-signature' con la firma del body.
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

  // La firma de Culqi viene en formato hex
  const sigBytes = Uint8Array.from(
    signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  );

  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody));
}
