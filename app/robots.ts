import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nutriia.pe';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/planes', '/auth/login', '/auth/register', '/terminos', '/privacidad'],
        disallow: ['/dashboard', '/mi-plan', '/historial', '/perfil', '/suscripcion', '/onboarding', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
