import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { prisma } from '@/lib/prisma/client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HealthProfileForm } from '@/components/dashboard/HealthProfileForm';

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // ── Verificar suscripción activa ──────────────────────────
  const subscription = await prisma.subscription.findFirst({
    where: { user_id: user.id, status: 'active' },
  });

  if (!subscription) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">Necesitas una suscripción activa para editar tu perfil.</p>
        <Link href="/planes" className={cn(buttonVariants(), 'mt-4')}>Ver planes</Link>
      </div>
    );
  }

  const healthProfile = await prisma.userHealthProfile.findUnique({
    where: { user_id: user.id },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mi perfil de salud</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualiza tus datos y regenera tu plan cuando cambien tus metas.
        </p>
      </div>

      <HealthProfileForm initialData={healthProfile as import('@/types/database').UserHealthProfile | null} />
    </div>
  );
}
