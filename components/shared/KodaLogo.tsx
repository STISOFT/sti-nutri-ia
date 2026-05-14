import Image from 'next/image';
import { cn } from '@/lib/utils';

interface KodaLogoProps {
  /** Tamaño en pixeles (lado del cuadrado). Default: 28. */
  size?: number;
  /** Prioridad de carga — activar en logos above-the-fold (navbar). */
  priority?: boolean;
  className?: string;
}

export function KodaLogo({ size = 28, priority = false, className }: KodaLogoProps) {
  return (
    <Image
      src="/logo-koda.png"
      alt="KODA"
      width={size}
      height={size}
      priority={priority}
      className={cn('rounded-md', className)}
    />
  );
}
