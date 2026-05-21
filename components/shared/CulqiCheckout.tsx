'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Loader2Icon,
  LockIcon,
  AlertTriangleIcon,
  UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { PLANS, type PlanId } from '@/types/database';
import { subscribePaymentSchema, type SubscribePaymentInput } from '@/lib/validations/payment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const IS_MOCK = process.env.NEXT_PUBLIC_CULQI_MOCK === 'true';

type ButtonVariant =
  | 'default'
  | 'outline'
  | 'ghost'
  | 'secondary'
  | 'destructive'
  | 'link';

interface CulqiCheckoutProps {
  planId: PlanId;
  userEmail: string;
  userFullName?: string;
  buttonLabel?: string;
  buttonClassName?: string;
  buttonVariant?: ButtonVariant;
  onSuccess?: () => void;
}

// CustomerForm captura los datos que Culqi exige para crear un Customer
// y guarda en estado local hasta que el token de tarjeta esté listo.
type CustomerForm = SubscribePaymentInput['customer'];

// ─── Componente principal ──────────────────────────────────────
export function CulqiCheckout({
  planId,
  userEmail,
  userFullName,
  buttonLabel,
  buttonClassName,
  buttonVariant = 'default',
  onSuccess,
}: CulqiCheckoutProps) {
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = useState(IS_MOCK);
  const [formOpen, setFormOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const plan = PLANS[planId];

  // ── Pre-fill nombre desde Supabase user_metadata si está ────
  const [firstFromName, lastFromName] = splitFullName(userFullName);
  const form = useForm<CustomerForm>({
    resolver: zodResolver(subscribePaymentSchema.shape.customer),
    defaultValues: {
      first_name: firstFromName,
      last_name: lastFromName,
      email: userEmail,
      address: '',
      address_city: 'Lima',
      country_code: 'PE',
      phone_number: '',
    },
  });

  // ── Carga lazy de Culqi.js v4 ───────────────────────────────
  useEffect(() => {
    if (IS_MOCK) return;
    if (document.getElementById('culqi-script')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'culqi-script';
    script.src = 'https://checkout.culqi.com/js/v4';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast.error('Error al cargar el sistema de pagos. Recarga la página.');
    };
    document.head.appendChild(script);
  }, []);

  // ── Llamada al backend con el token + datos del customer ────
  const callSubscribeAPI = useCallback(
    async (token: string, customer: CustomerForm) => {
      setProcessing(true);
      try {
        const res = await fetch('/api/payments/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, plan_id: planId, customer }),
        });
        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          toast.error(body.error ?? 'No pudimos procesar el pago. Inténtalo de nuevo.');
          return;
        }

        toast.success('¡Suscripción activada! Bienvenido a KODA.');
        onSuccess?.();
        setFormOpen(false);
        router.push('/onboarding');
        router.refresh();
      } catch {
        toast.error('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      } finally {
        setProcessing(false);
      }
    },
    [planId, router, onSuccess]
  );

  // ── Submit del form: si todo válido → abrir Culqi.js ────────
  function handleContinueToPayment(customer: CustomerForm) {
    // Doble validación defensiva: aunque react-hook-form ya valida
    // con zodResolver, re-validamos acá por si el botón submit
    // bypaseó el flujo (problema conocido con base-ui Button).
    const parsed = subscribePaymentSchema.shape.customer.safeParse(customer);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }
    const validatedCustomer = parsed.data;

    if (IS_MOCK) {
      void callSubscribeAPI('tkn_mock_dev', validatedCustomer);
      return;
    }
    const w = window as unknown as {
      Culqi?: {
        publicKey: string;
        init: () => void;
        settings: (s: Record<string, unknown>) => void;
        open: () => void;
        close?: () => void;
        token?: { id: string; object?: string };
        error?: { user_message?: string; merchant_message?: string };
      };
      culqi?: () => void;
    };
    const culqi = w.Culqi;

    if (!scriptLoaded || !culqi) {
      toast.error('El sistema de pagos aún está cargando. Espera un momento.');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    if (!publicKey) {
      toast.error('Configuración de pagos no disponible.');
      return;
    }

    // Reasignamos window.culqi en CADA apertura del modal usando un
    // closure que captura los datos validados de ESTE intento.
    // Esto evita el problema de múltiples instancias de CulqiCheckout
    // pisándose la asignación de window.culqi (la página renderiza
    // un componente por plan, pero solo puede haber UN window.culqi
    // global; el closure asegura que el que abre la modal es el que
    // procesa el token, no el último que se montó).
    w.culqi = () => {
      const c = w.Culqi;
      if (c?.token?.id && c.token.object === 'token') {
        c.close?.();
        void callSubscribeAPI(c.token.id, validatedCustomer);
      } else if (c?.error) {
        toast.error(
          c.error.user_message ??
            c.error.merchant_message ??
            'No pudimos validar tu tarjeta. Verifica los datos.'
        );
      }
    };

    culqi.publicKey = publicKey;
    culqi.init(); // v4 requiere init() antes de settings/open
    culqi.settings({
      title: 'KODA',
      currency: 'PEN',
      description: `Suscripción ${plan.name} — S/${plan.price_soles.toFixed(2)}/mes`,
      // Para suscripciones usamos amount como referencia del primer cobro.
      amount: plan.price_cents,
    });
    culqi.open();
  }

  const label = buttonLabel ?? `Suscribirme al plan ${plan.name}`;
  const disabled = (!scriptLoaded && !IS_MOCK) || processing;

  return (
    <>
      <Button
        onClick={() => setFormOpen(true)}
        disabled={disabled}
        variant={buttonVariant}
        className={buttonClassName}
      >
        {processing ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Procesando...
          </>
        ) : !scriptLoaded && !IS_MOCK ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Cargando...
          </>
        ) : (
          <>
            <LockIcon className="size-4" />
            {label}
          </>
        )}
      </Button>

      <Dialog open={formOpen} onOpenChange={(v) => !v && !processing && setFormOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="size-5 text-primary" />
              Datos para tu suscripción
            </DialogTitle>
            <DialogDescription>
              Necesitamos estos datos para procesar tu suscripción mensual al plan{' '}
              <strong>{plan.name}</strong> (S/{plan.price_soles.toFixed(2)}/mes).
            </DialogDescription>
          </DialogHeader>

          {IS_MOCK && (
            <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangleIcon className="size-3.5 shrink-0 mt-0.5" />
              <span>Modo prueba — ningún cargo real será realizado.</span>
            </div>
          )}

          <form
            onSubmit={form.handleSubmit(handleContinueToPayment)}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombres" error={form.formState.errors.first_name?.message}>
                <Input {...form.register('first_name')} placeholder="Juan" />
              </Field>
              <Field label="Apellidos" error={form.formState.errors.last_name?.message}>
                <Input {...form.register('last_name')} placeholder="Pérez" />
              </Field>
            </div>

            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input
                type="email"
                {...form.register('email')}
                placeholder="tu@email.com"
                readOnly
                className="bg-muted/40"
              />
            </Field>

            <Field label="Dirección" error={form.formState.errors.address?.message}>
              <Input {...form.register('address')} placeholder="Av. Ejemplo 123" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Ciudad" error={form.formState.errors.address_city?.message}>
                <Input {...form.register('address_city')} placeholder="Lima" />
              </Field>
              <Field label="Teléfono" error={form.formState.errors.phone_number?.message}>
                <Input
                  {...form.register('phone_number')}
                  placeholder="+51 999 999 999"
                  inputMode="tel"
                />
              </Field>
            </div>

            <input type="hidden" {...form.register('country_code')} value="PE" />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                <LockIcon className="mr-1 inline size-3" />
                Pago seguro vía Culqi
              </span>
              {/*
                Usamos <button> HTML nativo (no el wrapper de base-ui)
                para asegurarnos de que type="submit" dispare el
                onSubmit del <form> y se ejecute la validación de
                react-hook-form / zod. El Button de base-ui no propaga
                bien type="submit" en todos los casos.
              */}
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Continuar al pago
                    <LockIcon className="size-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Helpers ───────────────────────────────────────────────────
function splitFullName(full?: string): [string, string] {
  if (!full?.trim()) return ['', ''];
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], ''];
  return [parts[0], parts.slice(1).join(' ')];
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
