import { Hero } from '@/components/landing/Hero';
import { Benefits } from '@/components/landing/Benefits';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTABanner } from '@/components/landing/CTABanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NutriIA - Plan de Dieta Personalizado con IA | Perú',
  description:
    'Recibe tu plan de alimentación de 30 días personalizado con inteligencia artificial. Adaptado a tu cuerpo, tus objetivos y la gastronomía peruana. Desde S/29/mes.',
  openGraph: {
    title: 'NutriIA - Plan de Dieta Personalizado con IA',
    description:
      'Plan de alimentación de 30 días generado por IA. Adaptado a ti, con alimentos peruanos. Desde S/29/mes.',
    type: 'website',
    locale: 'es_PE',
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTABanner />
    </>
  );
}
