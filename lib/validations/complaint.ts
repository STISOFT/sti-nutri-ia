import { z } from 'zod';

// Libro de Reclamaciones — Ley N° 29571 (INDECOPI)
// Valida el payload del formulario público antes de persistir.

const complaintType = ['queja', 'reclamo'] as const;
const documentType = ['DNI', 'CE', 'PASAPORTE'] as const;

const documentIdSchema = z
  .string()
  .trim()
  .min(6, 'Documento mínimo 6 caracteres')
  .max(20, 'Documento máximo 20 caracteres')
  .regex(/^[A-Za-z0-9]+$/, 'Solo letras y números');

export const complaintSchema = z
  .object({
    type: z.enum(complaintType, { message: 'Selecciona queja o reclamo' }),
    document_type: z.enum(documentType, { message: 'Tipo de documento inválido' }),
    document_id: documentIdSchema,
    first_name: z.string().trim().min(2, 'Nombre requerido').max(80),
    last_name: z.string().trim().min(2, 'Apellidos requeridos').max(80),
    department: z.string().trim().min(2, 'Departamento requerido').max(60),
    province: z.string().trim().min(2, 'Provincia requerida').max(60),
    district: z.string().trim().min(2, 'Distrito requerido').max(60),
    address: z.string().trim().min(4, 'Dirección requerida').max(200),
    phone: z
      .string()
      .trim()
      .min(6, 'Teléfono mínimo 6 dígitos')
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, 'Teléfono inválido'),
    email: z.string().trim().toLowerCase().email('Correo inválido').max(120),
    is_minor: z.boolean(),
    guardian_name: z.string().trim().max(160).optional().or(z.literal('')),
    service_name: z.string().trim().max(160).optional().or(z.literal('')),
    amount_soles: z
      .number({ message: 'Monto inválido' })
      .nonnegative('Monto no puede ser negativo')
      .max(1_000_000)
      .optional(),
    detail: z
      .string()
      .trim()
      .min(10, 'Describe la incidencia con al menos 10 caracteres')
      .max(4000),
    request: z
      .string()
      .trim()
      .min(5, 'Indica tu pedido concreto')
      .max(2000),
    accepted_terms: z.literal(true, { message: 'Debes aceptar los términos' }),
  })
  .superRefine((data, ctx) => {
    if (data.is_minor && !data.guardian_name?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['guardian_name'],
        message: 'Si es menor de edad, indica el nombre del padre/madre/tutor',
      });
    }
  });

export type ComplaintInput = z.infer<typeof complaintSchema>;
