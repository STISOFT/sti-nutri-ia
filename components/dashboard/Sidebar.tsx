'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboardIcon,
  CalendarDaysIcon,
  HistoryIcon,
  UserIcon,
  CreditCardIcon,
  LeafIcon,
  LogOutIcon,
  MenuIcon,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserStore } from '@/lib/stores/user-store';
import { buttonVariants } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { label: 'Mi Plan', href: '/mi-plan', icon: CalendarDaysIcon },
  { label: 'Historial', href: '/historial', icon: HistoryIcon },
  { label: 'Perfil', href: '/perfil', icon: UserIcon },
  { label: 'Suscripción', href: '/suscripcion', icon: CreditCardIcon },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    toast.success('Sesión cerrada');
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-foreground"
          onClick={onNavigate}
        >
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <LeafIcon className="size-4 text-primary-foreground" />
          </div>
          <span className="text-base">NutriIA</span>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3 flex items-center justify-between">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-4" />
          Salir
        </Button>
      </div>
    </div>
  );
}

// ── Sidebar escritorio (fijo) ─────────────────────────────────
export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <NavContent />
    </aside>
  );
}

// ── Sidebar móvil (Sheet) ─────────────────────────────────────
export function MobileSidebarTrigger() {
  const { sidebarOpen, setSidebarOpen } = useUserStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'lg:hidden')}>
        <MenuIcon className="size-5" />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <NavContent onNavigate={() => setSidebarOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
