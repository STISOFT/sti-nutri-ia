// ============================================================
// MAILER — KODA
// Cliente centralizado de Resend + React Email.
// Todas las funciones son non-blocking (try/catch externo).
// ============================================================

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { PaymentConfirmationEmail } from '@/emails/PaymentConfirmationEmail';
import { DietPlanReadyEmail } from '@/emails/DietPlanReadyEmail';
import { SubscriptionRenewalEmail } from '@/emails/SubscriptionRenewalEmail';
import { PasswordResetEmail } from '@/emails/PasswordResetEmail';
import { ComplaintReceiptEmail } from '@/emails/ComplaintReceiptEmail';

// Dirección de envío — configurable por variable de entorno
const FROM = process.env.RESEND_FROM_EMAIL ?? 'KODA <hola@nutriia.pe>';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nutriia.pe';
const LOGO_URL = `${BASE_URL}/logo-koda.png`;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY no configurado');
  return new Resend(apiKey);
}

// ── Interfaces de parámetros ──────────────────────────────────

interface WelcomeEmailParams {
  to: string;
  fullName: string;
}

interface PaymentConfirmationEmailParams {
  to: string;
  fullName: string;
  planName: string;
  amountSoles: number;
  chargeId: string;
}

interface DietPlanReadyEmailParams {
  to: string;
  fullName: string;
  caloriesPerDay: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  monthYear: string;
}

interface RenewalReminderEmailParams {
  to: string;
  fullName: string;
  planName: string;
  renewalDate: string;
  amountSoles: number;
}

interface PasswordResetEmailParams {
  to: string;
  fullName: string;
  resetUrl: string;
}

interface ComplaintEmailParams {
  code: string;
  type: 'queja' | 'reclamo';
  document_type: string;
  document_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  province: string;
  district: string;
  address: string;
  is_minor: boolean;
  guardian_name?: string | null;
  service_name?: string | null;
  amount_soles?: number | null;
  detail: string;
  request: string;
  created_at: Date;
  deadline_at: Date;
}

// ── Funciones de envío ────────────────────────────────────────

/**
 * Correo de bienvenida al registrarse.
 * Se dispara desde /api/auth/callback tras verificar email.
 */
export async function sendWelcomeEmail({ to, fullName }: WelcomeEmailParams): Promise<void> {
  const resend = getResend();
  const html = await render(
    WelcomeEmail({ fullName, plansUrl: `${BASE_URL}/planes`, logoUrl: LOGO_URL })
  );

  await resend.emails.send({
    from: FROM,
    to,
    subject: '¡Bienvenido a KODA! Tu plan de dieta con IA te espera',
    html,
  });
}

/**
 * Confirmación de pago exitoso.
 * Se dispara desde /api/payments/confirm.
 */
export async function sendPaymentConfirmationEmail({
  to,
  fullName,
  planName,
  amountSoles,
  chargeId,
}: PaymentConfirmationEmailParams): Promise<void> {
  const resend = getResend();
  const html = await render(
    PaymentConfirmationEmail({
      fullName,
      planName,
      amountSoles,
      chargeId,
      profileUrl: `${BASE_URL}/onboarding`,
      logoUrl: LOGO_URL,
    })
  );

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Pago confirmado — Plan ${planName} activado en KODA`,
    html,
  });
}

/**
 * Aviso de que el plan de dieta generado está disponible.
 * Se dispara desde /api/diet/generate.
 */
export async function sendDietPlanReadyEmail({
  to,
  fullName,
  caloriesPerDay,
  proteinG = 0,
  carbsG = 0,
  fatG = 0,
  monthYear,
}: DietPlanReadyEmailParams): Promise<void> {
  const resend = getResend();
  const html = await render(
    DietPlanReadyEmail({
      fullName,
      caloriesPerDay,
      proteinG,
      carbsG,
      fatG,
      monthYear,
      planUrl: `${BASE_URL}/mi-plan`,
      logoUrl: LOGO_URL,
    })
  );

  await resend.emails.send({
    from: FROM,
    to,
    subject: `🎉 Tu plan de dieta de ${monthYear} está listo — KODA`,
    html,
  });
}

/**
 * Recordatorio de renovación (5 días antes).
 * Se dispara desde /api/cron/renewal-reminder (Módulo 8).
 */
export async function sendRenewalReminderEmail({
  to,
  fullName,
  planName,
  renewalDate,
  amountSoles,
}: RenewalReminderEmailParams): Promise<void> {
  const resend = getResend();
  const html = await render(
    SubscriptionRenewalEmail({
      fullName,
      planName,
      renewalDate,
      amountSoles,
      manageUrl: `${BASE_URL}/suscripcion`,
      logoUrl: LOGO_URL,
    })
  );

  await resend.emails.send({
    from: FROM,
    to,
    subject: `🔔 Tu suscripción KODA se renueva el ${renewalDate}`,
    html,
  });
}

/**
 * Enlace de recuperación de contraseña.
 * Se dispara desde Supabase Auth directamente (auth.resetPasswordForEmail),
 * pero puede usarse desde un trigger propio si se desea personalizar el email.
 */
export async function sendPasswordResetEmail({
  to,
  fullName,
  resetUrl,
}: PasswordResetEmailParams): Promise<void> {
  const resend = getResend();
  const html = await render(
    PasswordResetEmail({ fullName, resetUrl, logoUrl: LOGO_URL })
  );

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Recupera el acceso a tu cuenta KODA',
    html,
  });
}

/**
 * Libro de Reclamaciones (INDECOPI):
 * envía copia al consumidor + notificación al admin.
 * Se dispara desde POST /api/complaints.
 *
 * COMPLAINTS_ADMIN_EMAIL define el destinatario interno; si no está
 * configurado, cae a RESEND_FROM_EMAIL.
 */
export async function sendComplaintEmails(params: ComplaintEmailParams): Promise<void> {
  const resend = getResend();
  const adminTo =
    process.env.COMPLAINTS_ADMIN_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? FROM;

  const formattedCreated = formatPeruDate(params.created_at);
  const formattedDeadline = formatPeruDate(params.deadline_at);

  const consumerHtml = await render(
    ComplaintReceiptEmail({
      ...params,
      created_at: formattedCreated,
      deadline_at: formattedDeadline,
      audience: 'consumer',
      logoUrl: LOGO_URL,
    })
  );
  const adminHtml = await render(
    ComplaintReceiptEmail({
      ...params,
      created_at: formattedCreated,
      deadline_at: formattedDeadline,
      audience: 'admin',
      logoUrl: LOGO_URL,
    })
  );

  const consumerSubject =
    params.type === 'reclamo'
      ? `Recibimos tu reclamo · ${params.code} — KODA`
      : `Recibimos tu queja · ${params.code} — KODA`;

  const adminSubject = `Nuevo ${params.type} en el Libro de Reclamaciones · ${params.code}`;

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: params.email,
      subject: consumerSubject,
      html: consumerHtml,
    }),
    resend.emails.send({
      from: FROM,
      to: adminTo,
      replyTo: params.email,
      subject: adminSubject,
      html: adminHtml,
    }),
  ]);
}

function formatPeruDate(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
