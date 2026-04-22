import { z } from 'zod';

// IDs de plan válidos
const planIds = ['basico', 'estandar', 'premium'] as const;

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

// Schema para el body del webhook de Culqi
export const culqiWebhookSchema = z.object({
  id: z.string(),
  object: z.string(),
  type: z.string(), // ej: 'charge.succeeded', 'charge.failed'
  data: z.object({
    id: z.string(),
    object: z.string().optional(),
    amount: z.number().optional(),
    currency_code: z.string().optional(),
    email: z.string().optional(),
    metadata: z
      .object({
        user_id: z.string().optional(),
        plan_id: z.string().optional(),
        subscription_id: z.string().optional(),
      })
      .optional(),
  }),
  created_at: z.number().optional(),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CulqiWebhookEvent = z.infer<typeof culqiWebhookSchema>;
