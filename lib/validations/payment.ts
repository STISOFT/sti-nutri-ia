import { z } from 'zod';

// IDs de plan válidos
const planIds = ['inicio', 'core', 'pro'] as const;

// Schema para confirmar un pago (cliente → /api/payments/confirm)
export const confirmPaymentSchema = z.object({
  token: z.string().min(1, 'Token de pago requerido'),
  plan_id: z.enum(planIds, { message: 'Plan inválido' }),
  email: z.string().email('Email inválido'),
});

// Schema para crear una orden (cliente → /api/payments/create-order)
export const createOrderSchema = z.object({
  plan_id: z.enum(planIds, { message: 'Plan inválido' }),
});

// Schema para el body del webhook de Culqi. Cubre eventos de charge
// (charge.succeeded, charge.failed) y de subscription (subscription.activate,
// subscription.charge.create, subscription.charge.error, subscription.cancel).
export const culqiWebhookSchema = z.object({
  id: z.string(),
  object: z.string(),
  type: z.string(),
  data: z.object({
    id: z.string(),
    object: z.string().optional(),
    amount: z.number().optional(),
    currency_code: z.string().optional(),
    email: z.string().optional(),
    // En eventos subscription.* puede venir el id de la subscription aquí
    subscription_id: z.string().optional(),
    plan_id: z.string().optional(),
    customer_id: z.string().optional(),
    current_period_start: z.number().optional(),
    current_period_end: z.number().optional(),
    next_billing_date: z.number().optional(),
    metadata: z
      .object({
        koda_user_id: z.string().optional(),
        koda_plan_id: z.string().optional(),
        // Compatibilidad con metadata viejos:
        user_id: z.string().optional(),
        plan_id: z.string().optional(),
        subscription_id: z.string().optional(),
      })
      .passthrough()
      .optional(),
  }).passthrough(),
  created_at: z.number().optional(),
});

// Schema para crear una suscripción (cliente → /api/payments/subscribe)
// Recibe el token de Culqi.js + plan_id + datos del cliente para crear
// Customer en Culqi (no estaban en charges).
export const subscribePaymentSchema = z.object({
  token: z.string().min(1, 'Token de pago requerido'),
  plan_id: z.enum(planIds, { message: 'Plan inválido' }),
  customer: z.object({
    first_name: z.string().trim().min(2, 'Nombre requerido').max(80),
    last_name: z.string().trim().min(2, 'Apellidos requeridos').max(80),
    email: z.string().email('Email inválido').toLowerCase(),
    // Culqi exige address de 6 a 99 caracteres ("debe ser de menos de
    // 100 caracteres, y más de 5"). Alineamos zod para mostrar el
    // error en el form en vez del genérico de Culqi.
    address: z
      .string()
      .trim()
      .min(6, 'Dirección muy corta (mínimo 6 caracteres, incluye calle y número)')
      .max(99, 'Dirección muy larga (máximo 99 caracteres)'),
    address_city: z.string().trim().min(2, 'Ciudad requerida').max(80),
    country_code: z
      .string()
      .length(2, 'Código de país debe tener 2 letras (ej. PE)')
      .toUpperCase(),
    phone_number: z
      .string()
      .trim()
      .min(6, 'Teléfono mínimo 6 dígitos')
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, 'Teléfono inválido'),
  }),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type SubscribePaymentInput = z.infer<typeof subscribePaymentSchema>;
export type CulqiWebhookEvent = z.infer<typeof culqiWebhookSchema>;
