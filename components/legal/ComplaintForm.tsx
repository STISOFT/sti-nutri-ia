'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { complaintSchema, type ComplaintInput } from '@/lib/validations/complaint';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SuccessState {
  code: string;
  type: 'queja' | 'reclamo';
  deadline_at: string;
  email: string;
}

export function ComplaintForm() {
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintInput>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      type: 'reclamo',
      document_type: 'DNI',
      is_minor: false,
    },
  });

  const isMinor = watch('is_minor');

  async function onSubmit(data: ComplaintInput) {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? 'No pudimos registrar tu reclamo. Inténtalo más tarde.');
      return;
    }

    const body = (await res.json()) as {
      code: string;
      type: 'queja' | 'reclamo';
      deadline_at: string;
    };

    setSuccess({
      code: body.code,
      type: body.type,
      deadline_at: body.deadline_at,
      email: data.email,
    });
    reset();
  }

  if (success) {
    return <SuccessView {...success} onNew={() => setSuccess(null)} />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      {/* Tipo: queja o reclamo */}
      <Fieldset legend="Tipo de registro">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <Radio {...register('type')} value="queja" label="Queja" />
          <Radio {...register('type')} value="reclamo" label="Reclamo" defaultChecked />
        </div>
        <p className="text-xs text-muted-foreground">
          <strong>Queja:</strong> disconformidad con la atención al público.
          <br />
          <strong>Reclamo:</strong> disconformidad con el bien o servicio.
        </p>
        {errors.type && <FieldError msg={errors.type.message!} />}
      </Fieldset>

      {/* Identificación */}
      <Fieldset legend="Identificación del consumidor">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tipo de documento" error={errors.document_type?.message}>
            <select
              {...register('document_type')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="DNI">DNI</option>
              <option value="CE">CE</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </Field>
          <Field label="N° de documento" error={errors.document_id?.message} className="sm:col-span-2">
            <Input {...register('document_id')} placeholder="12345678" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombres" error={errors.first_name?.message}>
            <Input {...register('first_name')} placeholder="Juan" />
          </Field>
          <Field label="Apellidos" error={errors.last_name?.message}>
            <Input {...register('last_name')} placeholder="Pérez García" />
          </Field>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-muted/30 p-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register('is_minor')}
              className="size-4 rounded border-input accent-primary"
            />
            <span>El consumidor es menor de edad</span>
          </label>
          {isMinor && (
            <Field
              label="Nombre del padre, madre o tutor"
              error={errors.guardian_name?.message}
            >
              <Input {...register('guardian_name')} placeholder="Nombre completo" />
            </Field>
          )}
        </div>
      </Fieldset>

      {/* Domicilio + contacto */}
      <Fieldset legend="Domicilio y contacto">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Departamento" error={errors.department?.message}>
            <Input {...register('department')} placeholder="Lima" />
          </Field>
          <Field label="Provincia" error={errors.province?.message}>
            <Input {...register('province')} placeholder="Lima" />
          </Field>
          <Field label="Distrito" error={errors.district?.message}>
            <Input {...register('district')} placeholder="Miraflores" />
          </Field>
        </div>

        <Field label="Dirección" error={errors.address?.message}>
          <Input {...register('address')} placeholder="Av. Ejemplo 123, Dpto 4" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono" error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="+51 999 999 999" />
          </Field>
          <Field label="Correo electrónico" error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="tu@email.com" />
          </Field>
        </div>
      </Fieldset>

      {/* Detalle del reclamo */}
      <Fieldset legend="Detalle">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Servicio (opcional)"
            error={errors.service_name?.message}
            hint="¿Cuál de nuestros planes contrataste?"
          >
            <Input {...register('service_name')} placeholder="Plan CORE" />
          </Field>
          <Field
            label="Monto reclamado en S/ (opcional)"
            error={errors.amount_soles?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('amount_soles', {
                setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
              })}
              placeholder="59.90"
            />
          </Field>
        </div>

        <Field
          label="Detalle de la incidencia"
          error={errors.detail?.message}
          hint="Describe qué ocurrió con el mayor detalle posible."
        >
          <Textarea
            rows={5}
            {...register('detail')}
            placeholder="Ej. El plan se generó incompleto, faltan las recetas de la semana 3..."
          />
        </Field>

        <Field
          label="Pedido del consumidor"
          error={errors.request?.message}
          hint="¿Qué solución concreta esperas?"
        >
          <Textarea
            rows={3}
            {...register('request')}
            placeholder="Ej. Solicito la regeneración completa de mi plan o el reembolso del mes."
          />
        </Field>
      </Fieldset>

      {/* Términos */}
      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            {...register('accepted_terms')}
            className="mt-0.5 size-4 rounded border-input accent-primary"
          />
          <span>
            He leído y acepto los{' '}
            <Link href="/terminos" className="text-primary hover:underline">
              Términos
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
            , y autorizo el tratamiento de mis datos para gestionar esta solicitud.
          </span>
        </label>
        {errors.accepted_terms && <FieldError msg={errors.accepted_terms.message!} />}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-fit">
        {isSubmitting ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar reclamo'
        )}
      </Button>
    </form>
  );
}

// ── Vista de éxito ─────────────────────────────────────────────
function SuccessView({
  code,
  type,
  deadline_at,
  email,
  onNew,
}: SuccessState & { onNew: () => void }) {
  const deadline = new Date(deadline_at).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2Icon className="size-7 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground">
        Recibimos tu {type}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Tu registro fue creado correctamente. Conserva el código a continuación
        como constancia. Te enviamos una copia a{' '}
        <span className="font-medium text-foreground">{email}</span>.
      </p>
      <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-6 py-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Código de registro
        </p>
        <p className="font-display text-xl font-bold text-primary">{code}</p>
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        Te responderemos por correo dentro del plazo legal de 30 días
        calendario, a más tardar el{' '}
        <span className="font-medium text-foreground">{deadline}</span>.
      </p>
      <Button variant="outline" onClick={onNew}>
        Registrar otro reclamo
      </Button>
    </div>
  );
}

// ── Helpers de presentación ────────────────────────────────────
function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-foreground">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <FieldError msg={error} />}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-xs text-destructive">{msg}</p>;
}

function Radio({
  value,
  label,
  defaultChecked,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="radio"
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 border-input accent-primary"
        {...rest}
      />
      <span className="font-medium text-foreground">{label}</span>
    </label>
  );
}
