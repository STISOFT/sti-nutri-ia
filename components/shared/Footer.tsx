import Link from 'next/link';
import { LeafIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
    { label: 'Contacto', href: 'mailto:hola@nutriia.pe' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-foreground">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary">
                <LeafIcon className="size-4 text-primary-foreground" />
              </div>
              <span>NutriIA</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Planes de alimentación personalizados con IA para el mercado peruano.
            </p>
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
              {FOOTER_LINKS.legal.map(({ label, href }) => (
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
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NutriIA. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            NutriIA no reemplaza el consejo médico profesional.
          </p>
        </div>
      </div>
    </footer>
  );
}
