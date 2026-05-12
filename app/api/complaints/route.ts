import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { complaintSchema } from '@/lib/validations/complaint';
import { sendComplaintEmails } from '@/lib/resend/mailer';

// Plazo legal de respuesta: 30 días calendario (INDECOPI).
const RESPONSE_DEADLINE_DAYS = 30;

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Payload inválido' },
      { status: 400 }
    );
  }

  const parsed = complaintSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const now = new Date();
  const deadline = new Date(now.getTime() + RESPONSE_DEADLINE_DAYS * 24 * 60 * 60 * 1000);
  const code = await generateCode(now);

  let created;
  try {
    created = await prisma.complaintRecord.create({
      data: {
        code,
        type: data.type,
        document_type: data.document_type,
        document_id: data.document_id,
        first_name: data.first_name,
        last_name: data.last_name,
        department: data.department,
        province: data.province,
        district: data.district,
        address: data.address,
        phone: data.phone,
        email: data.email,
        is_minor: data.is_minor,
        guardian_name: data.is_minor ? data.guardian_name || null : null,
        service_name: data.service_name || null,
        amount_soles: typeof data.amount_soles === 'number' ? data.amount_soles : null,
        detail: data.detail,
        request: data.request,
        deadline_at: deadline,
      },
    });
  } catch (err) {
    console.error('[api/complaints] Error al persistir:', err);
    return NextResponse.json(
      { error: 'No pudimos registrar tu reclamo. Inténtalo más tarde.' },
      { status: 500 }
    );
  }

  // Emails en background — no bloqueamos la respuesta si Resend falla,
  // el reclamo ya quedó persistido y el usuario verá el código en pantalla.
  try {
    await sendComplaintEmails({
      code: created.code,
      type: created.type as 'queja' | 'reclamo',
      document_type: created.document_type,
      document_id: created.document_id,
      first_name: created.first_name,
      last_name: created.last_name,
      email: created.email,
      phone: created.phone,
      department: created.department,
      province: created.province,
      district: created.district,
      address: created.address,
      is_minor: created.is_minor,
      guardian_name: created.guardian_name,
      service_name: created.service_name,
      amount_soles: created.amount_soles,
      detail: created.detail,
      request: created.request,
      created_at: created.created_at,
      deadline_at: created.deadline_at,
    });
  } catch (err) {
    console.error('[api/complaints] Error al enviar emails:', err);
  }

  return NextResponse.json(
    {
      code: created.code,
      type: created.type,
      created_at: created.created_at,
      deadline_at: created.deadline_at,
    },
    { status: 201 }
  );
}

/**
 * Código correlativo público: LR-YYYY-NNNN.
 * Cuenta los registros del año en curso para asignar el siguiente
 * número con padding de 4 dígitos.
 */
async function generateCode(now: Date): Promise<string> {
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const count = await prisma.complaintRecord.count({
    where: { created_at: { gte: startOfYear } },
  });
  const next = String(count + 1).padStart(4, '0');
  return `LR-${year}-${next}`;
}
