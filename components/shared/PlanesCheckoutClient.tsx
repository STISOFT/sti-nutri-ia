'use client';

import { CulqiCheckout } from '@/components/shared/CulqiCheckout';
import { type PlanId } from '@/types/database';

interface PlanesCheckoutClientProps {
  planId: PlanId;
  userEmail: string;
  highlight: boolean;
  planName: string;
}

/**
 * Wrapper client-side del checkout para la página /planes.
 * Necesario porque CulqiCheckout es 'use client' y /planes es Server Component.
 */
export function PlanesCheckoutClient({
  planId,
  userEmail,
  highlight,
  planName,
}: PlanesCheckoutClientProps) {
  return (
    <CulqiCheckout
      planId={planId}
      userEmail={userEmail}
      buttonLabel={`Empezar con ${planName}`}
      buttonVariant={highlight ? 'default' : 'outline'}
      buttonClassName="mt-auto w-full"
    />
  );
}
