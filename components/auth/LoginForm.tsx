'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeOffIcon, Loader2Icon, MailIcon } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginInput) {
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      // Email aún no verificado
      if (error.message.includes('Email not confirmed')) {
        setEmailNotVerified(true);
        setUnverifiedEmail(data.email);
        return;
      }
      // Credenciales inválidas
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('invalid_grant')
      ) {
        toast.error('Email o contraseña incorrectos. Inténtalo de nuevo.');
        return;
      }
      toast.error('Error al iniciar sesión. Inténtalo de nuevo.');
      return;
    }

    // Redirigir según el estado del usuario
    const user = authData.user;
    if (!user) {
      toast.error('Error inesperado. Inténtalo de nuevo.');
      return;
    }

    // Verificar estado del usuario en nuestra BD (via API server-side)
    const statusRes = await fetch('/api/auth/status');
    if (!statusRes.ok) {
      toast.error('Error al verificar el estado de tu cuenta.');
      return;
    }
    const { hasSubscription, hasHealthProfile } = await statusRes.json() as {
      hasSubscription: boolean;
      hasHealthProfile: boolean;
    };

    if (!hasSubscription) {
      // Sin suscripción activa → página de planes
      router.push('/planes');
    } else if (!hasHealthProfile) {
      // Con suscripción pero sin perfil de salud → onboarding
      router.push('/onboarding');
    } else {
      // Todo completo → dashboard
      router.push('/dashboard');
    }

    router.refresh();
  }

  async function handleResendVerification() {
    setResending(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: unverifiedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      toast.error('No se pudo reenviar el correo. Inténtalo más tarde.');
    } else {
      toast.success('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
    }
    setResending(false);
  }

  // Vista alternativa cuando el email no está verificado
  if (emailNotVerified) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <MailIcon className="size-7 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Verifica tu correo</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enviamos un enlace de verificación a{' '}
            <span className="font-medium text-foreground">{unverifiedEmail}</span>.
            Revisa tu bandeja de entrada (y la carpeta de spam).
          </p>
        </div>

        <Button
          onClick={handleResendVerification}
          disabled={resending}
          variant="outline"
          className="w-full"
        >
          {resending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Reenviando...
            </>
          ) : (
            'Reenviar correo de verificación'
          )}
        </Button>

        <button
          onClick={() => setEmailNotVerified(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Contraseña con toggle de visibilidad */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <ForgotPasswordLink />
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contraseña"
            className="pr-9"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Botón submit */}
      <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>

      {/* Link a registro */}
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register" className="text-primary hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}

// Componente separado para el link de recuperación (evita re-renders en el form)
function ForgotPasswordLink() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [email, setEmail] = useState('');

  async function handleForgotPassword() {
    if (!email) {
      toast.error('Ingresa tu correo para recuperar la contraseña.');
      return;
    }
    setSending(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?type=recovery`,
    });

    if (error) {
      toast.error('No se pudo enviar el correo. Inténtalo más tarde.');
    } else {
      setSent(true);
      toast.success('Correo de recuperación enviado. Revisa tu bandeja.');
    }
    setSending(false);
  }

  if (sent) {
    return <span className="text-xs text-primary">¡Correo enviado!</span>;
  }

  if (showInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-6 rounded border border-border px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={sending}
          className="text-xs text-primary hover:underline disabled:opacity-50"
        >
          {sending ? '...' : 'Enviar'}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowInput(true)}
      className="text-xs text-muted-foreground hover:text-foreground"
    >
      ¿Olvidaste tu contraseña?
    </button>
  );
}
