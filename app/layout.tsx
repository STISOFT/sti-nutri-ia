import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';

// Fuente principal para el cuerpo de texto
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Fuente display para títulos y headings
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'NutriIA - Plan de Dieta Personalizado con IA',
  description:
    'Recibe tu plan de alimentación de 30 días personalizado con inteligencia artificial. Adaptado a tus objetivos, preferencias y contexto peruano.',
  keywords: ['dieta', 'nutrición', 'plan alimenticio', 'inteligencia artificial', 'Perú'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Toasts globales — tema automático según el modo claro/oscuro */}
          <Toaster richColors theme="system" position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
