import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase con service_role key — omite RLS.
 * Solo usar en API Routes server-side, nunca en el cliente.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Variables de entorno de Supabase no configuradas');
  }

  // Sin genérico Database — los tipos propios de supabase-js son suficientes
  // para operaciones CRUD básicas en API Routes
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
