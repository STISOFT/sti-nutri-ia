import Link from 'next/link';
import { LeafIcon, HomeIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-2 font-bold text-foreground">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary">
          <LeafIcon className="size-4 text-primary-foreground" />
        </div>
        <span className="text-xl">NutriIA</span>
      </Link>

      {/* 404 */}
      <p className="text-8xl font-black text-primary/20 leading-none select-none">404</p>

      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
        Página no encontrada
      </h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        La página que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
      </p>

      <Link
        href="/"
        className={cn(buttonVariants(), 'mt-8 gap-2')}
      >
        <HomeIcon className="size-4" />
        Volver al inicio
      </Link>
    </div>
  );
}
