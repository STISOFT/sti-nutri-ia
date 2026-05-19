import Link from 'next/link';
import { BookOpenIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { KodaLogo } from '@/components/shared/KodaLogo';

type FooterLink = { label: string; href: string; icon?: LucideIcon };

const FOOTER_LINKS = {
  producto: [
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
    { label: 'Testimonios', href: '#testimonios' },
    { label: 'FAQ', href: '#faq' },
  ],
  cuenta: [
    { label: 'Iniciar sesión', href: '/auth/login' },
    { label: 'Registrarse', href: '/auth/register' },
    { label: 'Mi dashboard', href: '/dashboard' },
  ],
  legal: [
    { label: 'Términos de servicio', href: '/terminos' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cambios y devoluciones', href: '/cambios-y-devoluciones' },
    {
      label: 'Libro de Reclamaciones',
      href: '/libro-de-reclamaciones',
      icon: BookOpenIcon,
    },
    { label: 'Contacto', href: 'mailto:contacto@koda-ia.com' },
  ] satisfies FooterLink[],
};

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-foreground">
              <KodaLogo size={28} />
              <span>KODA</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Planes de alimentación personalizados con IA para el mercado peruano.
            </p>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>3BMARKETPLACE S.A.C.</span>
              <span>RUC 20613499572</span>
              <span>Jr. García Villón 199, Cercado de Lima</span>
              <a
                href="tel:+51932421460"
                className="transition-colors hover:text-foreground"
              >
                Telf. 932 421 460
              </a>
              <a
                href="mailto:contacto@koda-ia.com"
                className="transition-colors hover:text-foreground"
              >
                contacto@koda-ia.com
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Hecho con ❤️ en Perú 🇵🇪
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Producto</h4>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.producto.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Cuenta</h4>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.cuenta.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.legal.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {Icon && <Icon className="size-4" aria-hidden />}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} 3BMARKETPLACE S.A.C. · KODA. Todos los
            derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            KODA no reemplaza el consejo médico profesional.
          </p>
        </div>
      </div>
    </footer>
  );
}
