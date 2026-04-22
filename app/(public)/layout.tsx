import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Leer sesión en el servidor para evitar flash de estado incorrecto en el Navbar
  let isLoggedIn = false;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    // Si falla la lectura de sesión, mostrar estado no autenticado
  }

  return (
    <>
      <Navbar initialIsLoggedIn={isLoggedIn} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
