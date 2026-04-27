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

// Dirección de envío — configurable por variable de entorno
const FROM = process.env.RESEND_FROM_EMAIL ?? 'KODA <hola@nutriia.pe>';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nutriia.pe';

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

// ── Funciones de envío ────────────────────────────────────────

/**
 * Correo de bienvenida al registrarse.
 * Se dispara desde /api/auth/callback tras verificar email.
 */
export async function sendWelcomeEmail({ to, fullName }: WelcomeEmailParams): Promise<void> {
  const resend = getResend();
  const html = await render(
    WelcomeEmail({ fullName, plansUrl: `${BASE_URL}/planes` })
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
    PasswordResetEmail({ fullName, resetUrl })
  );

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Recupera el acceso a tu cuenta KODA',
    html,
  });
}
