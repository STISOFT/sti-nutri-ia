/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================
// MAILER — NutriIA (stub para Módulo 4, implementado en Módulo 5)
// Las funciones están definidas pero no envían emails hasta que
// se configure RESEND_API_KEY y se implementen las plantillas.
// ============================================================

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

// Stub: se reemplazará en Módulo 5 con implementación real de Resend
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendWelcomeEmail(_params: WelcomeEmailParams): Promise<void> {
  // TODO Módulo 5
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendPaymentConfirmationEmail(
  _params: PaymentConfirmationEmailParams
): Promise<void> {
  // TODO Módulo 5
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendDietPlanReadyEmail(
  _params: DietPlanReadyEmailParams
): Promise<void> {
  // TODO Módulo 5
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendRenewalReminderEmail(
  _params: RenewalReminderEmailParams
): Promise<void> {
  // TODO Módulo 5
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendPasswordResetEmail(
  _params: PasswordResetEmailParams
): Promise<void> {
  // TODO Módulo 5
}
