import { z } from 'zod';

// Schemas definidos fuera del componente para evitar recreación en cada render
// Zod v4: los errores de tipo se configuran con { error: '...' }

export const registerSchema = z.object({
  full_name: z
    .string({ error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  email: z
    .string({ error: 'El correo es obligatorio' })
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string({ error: 'La contraseña es obligatoria' })
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'El correo es obligatorio' })
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string({ error: 'La contraseña es obligatoria' })
    .min(1, 'Ingresa tu contraseña'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: 'El correo es obligatorio' })
    .email('Ingresa un correo electrónico válido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
