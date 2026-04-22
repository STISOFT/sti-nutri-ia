/** @type {import('next').NextConfig} */
const nextConfig = {
  // Headers de seguridad HTTP para todas las rutas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Evita que el sitio sea embebido en iframes (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Evita MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla info del referrer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HTTP Strict Transport Security (fuerza HTTPS en producción)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Permisos del navegador (desactiva features no usadas)
          // payment se permite desde Culqi para el checkout
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: propio + Culqi.js + inline necesario para Next.js
              "script-src 'self' 'unsafe-inline' https://checkout.culqi.com",
              // Estilos: propio + inline (necesario para Tailwind/shadcn)
              "style-src 'self' 'unsafe-inline'",
              // Imágenes: propio + data URIs + blob para PDF
              "img-src 'self' data: blob:",
              // Fuentes: propio
              "font-src 'self'",
              // Conexiones: propio + Supabase + Culqi + Anthropic + Resend
              "connect-src 'self' https://*.supabase.co https://secure.culqi.com https://api.anthropic.com https://api.resend.com",
              // Frames: Culqi checkout
              "frame-src https://checkout.culqi.com",
              // Workers: blob para PDF rendering
              "worker-src blob:",
              // Object: ninguno
              "object-src 'none'",
              // Evita embedding en iframes (complementa X-Frame-Options)
              "frame-ancestors 'none'",
              // Base URI: solo propio
              "base-uri 'self'",
              // Form action: solo propio
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Desactiva el header X-Powered-By: Next.js
  poweredByHeader: false,
};

export default nextConfig;
