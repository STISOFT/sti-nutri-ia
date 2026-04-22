'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2Icon, LockIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PLANS, type PlanId } from '@/types/database';
import { Button } from '@/components/ui/button';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';

interface CulqiCheckoutProps {
  planId: PlanId;
  userEmail: string;
  buttonLabel?: string;
  buttonClassName?: string;
  buttonVariant?: ButtonVariant;
  onSuccess?: () => void;
}

/**
 * Componente de checkout con Culqi.js.
 * Carga el script dinámicamente, abre el modal de pago y
 * procesa el token en /api/payments/confirm.
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const plan = PLANS[planId];

  // Cargar Culqi.js una sola vez
  useEffect(() => {
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

  // Manejar el evento 'payment' que dispara Culqi.js con el token
  const handlePayment = useCallback(
    async (event: Event) => {
      const culqiEvent = event as unknown as { token?: { id: string } };
      const token = culqiEvent.token;

      if (!token?.id) return;

      // Cerrar el modal de Culqi
      if (typeof window !== 'undefined' && window.Culqi) {
        window.Culqi.close();
      }

      setProcessing(true);

      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token.id,
            plan_id: planId,
            email: userEmail,
          }),
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
      }
    },
    [planId, userEmail, router, onSuccess]
  );

  // Registrar y limpiar el listener del evento payment
  useEffect(() => {
    document.addEventListener('payment', handlePayment);
    return () => {
      document.removeEventListener('payment', handlePayment);
    };
  }, [handlePayment]);

  function handleOpenCheckout() {
    if (!scriptLoaded || !window.Culqi) {
      toast.error('El sistema de pagos aún está cargando. Espera un momento.');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    if (!publicKey) {
      toast.error('Configuración de pagos no disponible. Contáctanos.');
      return;
    }

    // Configurar Culqi con los datos del plan
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
  );
}
