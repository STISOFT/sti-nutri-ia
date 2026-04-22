import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Cliente de Supabase para usar en Server Components, API Routes y Server Actions.
 * Usa las cookies del request para mantener la sesión del usuario.
 *
 * IMPORTANTE: Usar createBrowserClient en componentes con 'use client'.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll puede fallar en Server Components (solo lectura).
            // Es seguro ignorarlo — el middleware mantiene la sesión actualizada.
          }
        },
      },
    }
  );
}
