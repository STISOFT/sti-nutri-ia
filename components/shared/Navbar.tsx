'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeafIcon, MenuIcon, LayoutDashboardIcon, LogOutIcon } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const NAV_LINKS = [
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Precios', href: '#precios' },
  { label: 'Testimonios', href: '#testimonios' },
];

interface NavbarProps {
  /** Estado de autenticación pre-leído desde el servidor (evita flash de estado incorrecto). */
  initialIsLoggedIn?: boolean;
}

export function Navbar({ initialIsLoggedIn = false }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Iniciar con el valor del servidor para evitar el flash "no autenticado → autenticado"
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  useEffect(() => {
    // Sincronizar con el prop del servidor al montar (por si cambia en navegación)
    setIsLoggedIn(initialIsLoggedIn);
  }, [initialIsLoggedIn]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Escuchar cambios de sesión en tiempo real (login/logout durante la sesión)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    toast.success('Sesión cerrada');
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-foreground">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <LeafIcon className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg">KODA</span>
        </Link>

        {/* Links de navegación — Desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Acciones — Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
              >
                <LayoutDashboardIcon className="size-4" />
                Mi dashboard
              </Link>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLogout}>
                <LogOutIcon className="size-4" />
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                Iniciar sesión
              </Link>
              <Link href="/auth/register" className={cn(buttonVariants({ size: 'sm' }))}>
                Empezar gratis
              </Link>
            </>
          )}
        </div>

        {/* Menú hamburguesa — Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Abrir menú" />
              }
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-primary">
                    <LeafIcon className="size-3.5 text-primary-foreground" />
                  </div>
                  KODA
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-2 p-4 pt-0">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center gap-2')}
                    >
                      <LayoutDashboardIcon className="size-4" />
                      Mi dashboard
                    </Link>
                    <button
                      onClick={() => { setOpen(false); handleLogout(); }}
                      className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-center gap-2 text-muted-foreground')}
                    >
                      <LogOutIcon className="size-4" />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants(), 'w-full justify-center')}
                    >
                      Empezar gratis
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
