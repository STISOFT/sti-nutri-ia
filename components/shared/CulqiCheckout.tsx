'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2Icon, LockIcon, CreditCardIcon, AlertTriangleIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PLANS, type PlanId } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const IS_MOCK = process.env.NEXT_PUBLIC_CULQI_MOCK === 'true';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';

interface CulqiCheckoutProps {
  planId: PlanId;
  userEmail: string;
  buttonLabel?: string;
  buttonClassName?: string;
  buttonVariant?: ButtonVariant;
  onSuccess?: () => void;
}

// ── Formulario mock (solo para desarrollo/testing) ────────────
function MockCardForm({
  open,
  onClose,
  onConfirm,
  processing,
  planName,
  priceSoles,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  processing: boolean;
  planName: string;
  priceSoles: number;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-5 text-primary" />
            Datos de pago
          </DialogTitle>
        </DialogHeader>

        {/* Aviso de modo prueba */}
        <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangleIcon className="size-3.5 shrink-0 mt-0.5" />
          <span>Modo prueba — ningún cargo real será realizado</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="card-name">Nombre en la tarjeta</Label>
            <Input id="card-name" placeholder="JUAN PEREZ" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-number">Número de tarjeta</Label>
            <Input id="card-number" placeholder="4111 1111 1111 1111" maxLength={19} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="card-expiry">Vencimiento</Label>
              <Input id="card-expiry" placeholder="MM/AA" maxLength={5} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-cvv">CVV</Label>
              <Input id="card-cvv" placeholder="123" maxLength={4} type="password" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-muted-foreground">
            Plan {planName} — S/ {priceSoles}/mes
          </span>
          <Button onClick={onConfirm} disabled={processing} className="gap-2">
            {processing ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <LockIcon className="size-4" />
            )}
            {processing ? 'Procesando...' : 'Pagar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────
/**
 * Checkout con Culqi.js en producción.
 * En desarrollo (NEXT_PUBLIC_CULQI_MOCK=true) muestra un formulario
 * de tarjeta falso que omite la validación real de Culqi.
 */
export function CulqiCheckout({
  planId,
  userEmail,
  buttonLabel,
  buttonClassName,
  buttonVariant = 'default',
  onSuccess,
}: CulqiCheckoutProps) {
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = useState(IS_MOCK); // mock siempre listo
  const [processing, setProcessing] = useState(false);
  const [mockOpen, setMockOpen] = useState(false);
  const plan = PLANS[planId];

  // ── Modo real: cargar Culqi.js ────────────────────────────
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

  // ── Función compartida para llamar al API ─────────────────
  const callConfirmAPI = useCallback(
    async (token: string) => {
      setProcessing(true);
      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, plan_id: planId, email: userEmail }),
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error ?? 'Error al procesar el pago. Inténtalo de nuevo.');
          return;
        }

        toast.success('¡Pago exitoso! Bienvenido a NutriIA.');
        onSuccess?.();
        router.push('/onboarding');
        router.refresh();
      } catch {
        toast.error('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      } finally {
        setProcessing(false);
        setMockOpen(false);
      }
    },
    [planId, userEmail, router, onSuccess]
  );

  // ── Modo real: listener del evento Culqi ──────────────────
  const handlePayment = useCallback(
    async (event: Event) => {
      if (IS_MOCK) return;
      const culqiEvent = event as unknown as { token?: { id: string } };
      const token = culqiEvent.token;
      if (!token?.id) return;
      window.Culqi?.close();
      await callConfirmAPI(token.id);
    },
    [callConfirmAPI]
  );

  useEffect(() => {
    if (IS_MOCK) return;
    document.addEventListener('payment', handlePayment);
    return () => document.removeEventListener('payment', handlePayment);
  }, [handlePayment]);

  // ── Abrir checkout ────────────────────────────────────────
  function handleOpenCheckout() {
    if (IS_MOCK) {
      setMockOpen(true);
      return;
    }

    if (!scriptLoaded || !window.Culqi) {
      toast.error('El sistema de pagos aún está cargando. Espera un momento.');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    if (!publicKey) {
      toast.error('Configuración de pagos no disponible. Contáctanos.');
      return;
    }

    window.Culqi.publicKey = publicKey;
    window.Culqi.settings({
      title: 'NutriIA',
      currency: 'PEN',
      description: `Plan ${plan.name} — 1 mes`,
      amount: plan.price_cents,
    });
    window.Culqi.open();
  }

  const label = buttonLabel ?? `Suscribirme al plan ${plan.name}`;

  return (
    <>
      <Button
        onClick={handleOpenCheckout}
        disabled={!scriptLoaded || processing}
        variant={buttonVariant}
        className={buttonClassName}
      >
        {processing ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Procesando pago...
          </>
        ) : !scriptLoaded ? (
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

      {IS_MOCK && (
        <MockCardForm
          open={mockOpen}
          onClose={() => setMockOpen(false)}
          onConfirm={() => callConfirmAPI('mock_token_dev')}
          processing={processing}
          planName={plan.name}
          priceSoles={plan.price_soles}
        />
      )}
    </>
  );
}
