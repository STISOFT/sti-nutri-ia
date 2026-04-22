'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LeafIcon, MenuIcon } from 'lucide-react';
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

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-foreground">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <LeafIcon className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg">NutriIA</span>
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
          <Link href="/auth/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Iniciar sesión
          </Link>
          <Link href="/auth/register" className={cn(buttonVariants({ size: 'sm' }))}>
            Empezar gratis
          </Link>
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
                  NutriIA
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
