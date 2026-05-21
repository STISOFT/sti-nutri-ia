'use client';

import { useState } from 'react';
import { useForm, type UseFormRegister, type UseFormSetValue, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

import { quizAnswersSchema, stepSchemas, type QuizAnswersInput } from '@/lib/validations/method';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

// ============================================================
// AssessmentForm — Bloque 3 del Método (15 preguntas en 7 pasos).
// Solo client-side state management; submit a /api/onboarding/assessment.
// ============================================================

const TOTAL_STEPS = 7;

type FormValues = QuizAnswersInput;

export function AssessmentForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(quizAnswersSchema),
    mode: 'onTouched',
    defaultValues: {
      q1_goal: 'perder_grasa',
      q11_digestion_symptoms: [],
      // Strings vacíos para permitir validación en steps específicos
      wake_time: '',
      work_time: '',
      train_time: '',
      sleep_time: '',
      q10_typical_day: '',
      q15_food_restrictions: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
    getValues,
  } = form;

  const progress = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  async function next() {
    const key = `step${step}` as keyof typeof stepSchemas;
    const schema = stepSchemas[key];
    if (!schema) {
      setStep((s) => Math.min(TOTAL_STEPS, s + 1));
      return;
    }
    const fields = Object.keys(schema.shape) as (keyof FormValues)[];
    const ok = await trigger(fields);
    if (ok) setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function prev() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function onSubmit(data: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? 'No pudimos guardar tu evaluación.');
        setSubmitting(false);
        return;
      }
      toast.success('¡Evaluación completada!');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Error de red. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header con progreso */}
      <header className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Paso {step} de {TOTAL_STEPS}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} />
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          {step === 1 && <Step1Datos register={register} errors={errors} />}
          {step === 2 && (
            <Step2Cuerpo
              value={{
                q2: watch('q2_body_description'),
                q3: watch('q3_training_frequency'),
                q9: watch('q9_training_type'),
              }}
              setValue={setValue}
              errors={errors}
            />
          )}
          {step === 3 && <Step3Rutina register={register} value={watch('q13_sleep_hours')} setValue={setValue} errors={errors} />}
          {step === 4 && (
            <Step4Alimentacion
              register={register}
              value={{ q5: watch('q5_meals_per_day'), q10: watch('q10_food_quality') }}
              setValue={setValue}
              errors={errors}
            />
          )}
          {step === 5 && (
            <Step5Digestion
              value={{
                q6: watch('q6_inflammation_perception'),
                q11: watch('q11_digestion_symptoms') ?? [],
                q12: watch('q12_post_meal_sensation'),
              }}
              setValue={setValue}
              errors={errors}
            />
          )}
          {step === 6 && (
            <Step6Estres
              value={{ q4: watch('q4_main_difficulty'), q14: watch('q14_stress_level') }}
              setValue={setValue}
              errors={errors}
            />
          )}
          {step === 7 && <Step7Resumen values={getValues()} />}
        </div>

        {/* Navegación */}
        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={prev} disabled={step === 1 || submitting}>
            <ArrowLeftIcon className="size-4" />
            Anterior
          </Button>

          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={next}>
              Siguiente
              <ArrowRightIcon className="size-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <SparklesIcon className="size-4" />
                  Completar evaluación
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Sub-componentes de cada paso ──────────────────────────────

type FormErrors = FieldErrors<FormValues>;
type FormRegister = UseFormRegister<FormValues>;
type FormSetValue = UseFormSetValue<FormValues>;

function StepHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive">{msg}</p>;
}

function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: { value: T; label: string; hint?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="grid gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              'rounded-lg border px-4 py-3 text-left text-sm transition-colors ' +
              (value === opt.value
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40')
            }
          >
            <span className="font-medium text-foreground">{opt.label}</span>
            {opt.hint && <span className="mt-0.5 block text-xs text-muted-foreground">{opt.hint}</span>}
          </button>
        ))}
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function CheckboxGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
  error?: string;
}) {
  function toggle(v: T) {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      // si seleccionan "ninguno", limpiar los demás; si seleccionan otro y había "ninguno", quitar "ninguno"
      if (v === ('ninguno' as T)) {
        onChange([v]);
      } else {
        onChange([...value.filter((x) => x !== ('ninguno' as T)), v]);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={
                'flex items-center gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-colors ' +
                (checked
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border bg-card hover:border-primary/40')
              }
            >
              <span
                className={
                  'flex size-4 shrink-0 items-center justify-center rounded border ' +
                  (checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input')
                }
              >
                {checked && <CheckCircle2Icon className="size-3" />}
              </span>
              <span className="text-foreground">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <FieldError msg={error} />
    </div>
  );
}

// ─── Step 1: Objetivo + Datos físicos ─────────────────────────
function Step1Datos({
  register,
  errors,
}: {
  register: FormRegister;
  errors: FormErrors;
}) {
  return (
    <>
      <StepHeader
        title="Tu objetivo y datos básicos"
        description="Empecemos con lo esencial. Tu objetivo en KODA es perder grasa de forma sostenible."
      />

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
        <SparklesIcon className="size-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">Tu objetivo: Perder grasa</p>
          <p className="text-xs text-muted-foreground">
            Por ahora solo manejamos planes de pérdida de grasa.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="age">Edad</Label>
          <Input
            id="age"
            type="number"
            min={16}
            max={90}
            {...register('age', { valueAsNumber: true })}
            placeholder="30"
          />
          <FieldError msg={errors.age?.message} />
        </div>

        <div>
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min={35}
            max={250}
            {...register('weight_kg', { valueAsNumber: true })}
            placeholder="75"
          />
          <FieldError msg={errors.weight_kg?.message} />
        </div>

        <div>
          <Label htmlFor="height">Estatura (cm)</Label>
          <Input
            id="height"
            type="number"
            min={130}
            max={220}
            {...register('height_cm', { valueAsNumber: true })}
            placeholder="175"
          />
          <FieldError msg={errors.height_cm?.message} />
        </div>

        <div>
          <Label htmlFor="waist">Cintura (cm) <span className="text-xs text-muted-foreground">— opcional</span></Label>
          <Input
            id="waist"
            type="number"
            step="0.1"
            min={40}
            max={200}
            {...register('waist_cm', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
            placeholder="80"
          />
          <FieldError msg={errors.waist_cm?.message} />
        </div>
      </div>
    </>
  );
}

// ─── Step 2: Cuerpo y actividad ───────────────────────────────
function Step2Cuerpo({
  value,
  setValue,
  errors,
}: {
  value: { q2?: string; q3?: string; q9?: string };
  setValue: FormSetValue;
  errors: FormErrors;
}) {
  return (
    <>
      <StepHeader
        title="Tu cuerpo y actividad"
        description="Cuéntanos cómo te percibes y cómo entrenas actualmente."
      />

      <div className="flex flex-col gap-6">
        <ChoiceGroup
          label="¿Cómo te describirías físicamente?"
          options={[
            { value: 'delgado', label: 'Delgado/a', hint: 'Me cuesta ganar masa muscular' },
            { value: 'acumulador_grasa', label: 'Complexión ancha', hint: 'Tiendo a subir grasa fácil' },
            { value: 'gordiflaco', label: 'Gordiflaco/a', hint: 'Delgado pero con grasa en zonas específicas' },
          ]}
          value={value.q2}
          onChange={(v) => setValue('q2_body_description', v as FormValues['q2_body_description'])}
          error={errors.q2_body_description?.message}
        />

        <ChoiceGroup
          label="¿Con qué frecuencia entrenas?"
          options={[
            { value: 'no_entreno', label: 'No entreno' },
            { value: '1_2', label: '1 a 2 veces por semana' },
            { value: '3_4', label: '3 a 4 veces por semana' },
            { value: '5_o_mas', label: '5 o más veces por semana' },
          ]}
          value={value.q3}
          onChange={(v) => setValue('q3_training_frequency', v as FormValues['q3_training_frequency'])}
          error={errors.q3_training_frequency?.message}
        />

        <ChoiceGroup
          label="¿Qué tipo de entrenamiento realizas?"
          options={[
            { value: 'pesas', label: 'Pesas' },
            { value: 'cardio', label: 'Cardio' },
            { value: 'ambos', label: 'Ambos' },
            { value: 'ninguno', label: 'Ninguno' },
          ]}
          value={value.q9}
          onChange={(v) => setValue('q9_training_type', v as FormValues['q9_training_type'])}
          error={errors.q9_training_type?.message}
        />
      </div>
    </>
  );
}

// ─── Step 3: Rutina diaria ────────────────────────────────────
function Step3Rutina({
  register,
  value,
  setValue,
  errors,
}: {
  register: FormRegister;
  value: string | undefined;
  setValue: FormSetValue;
  errors: FormErrors;
}) {
  return (
    <>
      <StepHeader
        title="Tu rutina diaria"
        description="Necesitamos entender cómo está estructurado tu día y tu descanso."
      />

      <div className="flex flex-col gap-6">
        <div>
          <Label className="text-sm font-semibold">Horarios habituales <span className="text-xs font-normal text-muted-foreground">— opcionales pero ayudan al plan</span></Label>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="wake_time" className="text-xs text-muted-foreground">Hora de levantarse</Label>
              <Input id="wake_time" type="time" {...register('wake_time')} />
              <FieldError msg={errors.wake_time?.message} />
            </div>
            <div>
              <Label htmlFor="work_time" className="text-xs text-muted-foreground">Hora de trabajo / estudio</Label>
              <Input id="work_time" type="time" {...register('work_time')} />
              <FieldError msg={errors.work_time?.message} />
            </div>
            <div>
              <Label htmlFor="train_time" className="text-xs text-muted-foreground">Hora de entrenamiento</Label>
              <Input id="train_time" type="time" {...register('train_time')} />
              <FieldError msg={errors.train_time?.message} />
            </div>
            <div>
              <Label htmlFor="sleep_time" className="text-xs text-muted-foreground">Hora de dormir</Label>
              <Input id="sleep_time" type="time" {...register('sleep_time')} />
              <FieldError msg={errors.sleep_time?.message} />
            </div>
          </div>
        </div>

        <ChoiceGroup
          label="¿Cuántas horas duermes en promedio?"
          options={[
            { value: 'menos_5', label: 'Menos de 5 horas' },
            { value: '5_6', label: '5 a 6 horas' },
            { value: '7_8', label: '7 a 8 horas' },
            { value: 'mas_8', label: 'Más de 8 horas' },
          ]}
          value={value}
          onChange={(v) => setValue('q13_sleep_hours', v as FormValues['q13_sleep_hours'])}
          error={errors.q13_sleep_hours?.message}
        />
      </div>
    </>
  );
}

// ─── Step 4: Alimentación ─────────────────────────────────────
function Step4Alimentacion({
  register,
  value,
  setValue,
  errors,
}: {
  register: FormRegister;
  value: { q5?: string; q10?: string };
  setValue: FormSetValue;
  errors: FormErrors;
}) {
  return (
    <>
      <StepHeader
        title="Tu alimentación"
        description="Cuéntanos cómo comes hoy. No te preocupes, no buscamos perfección."
      />

      <div className="flex flex-col gap-6">
        <ChoiceGroup
          label="¿Cuántas veces comes al día?"
          options={[
            { value: '1_2', label: '1 a 2 veces' },
            { value: '3', label: '3 comidas' },
            { value: '4_5', label: '4 a 5 comidas' },
          ]}
          value={value.q5}
          onChange={(v) => setValue('q5_meals_per_day', v as FormValues['q5_meals_per_day'])}
          error={errors.q5_meals_per_day?.message}
        />

        <ChoiceGroup
          label="¿Cómo describirías tu alimentación habitual?"
          options={[
            { value: 'casera', label: 'Mayormente casera' },
            { value: 'comida_rapida', label: 'Mayormente comida rápida' },
            { value: 'mezcla', label: 'Mezcla de ambas' },
          ]}
          value={value.q10}
          onChange={(v) => setValue('q10_food_quality', v as FormValues['q10_food_quality'])}
          error={errors.q10_food_quality?.message}
        />

        <div>
          <Label htmlFor="typical_day">Describe un día típico de comidas <span className="text-xs font-normal text-muted-foreground">— opcional, brevemente</span></Label>
          <Textarea
            id="typical_day"
            rows={3}
            placeholder="Ej. desayuno avena con frutas; almuerzo arroz con pollo; cena ensalada con huevo..."
            {...register('q10_typical_day')}
          />
          <FieldError msg={errors.q10_typical_day?.message} />
        </div>

        <div>
          <Label htmlFor="restrictions">¿Hay algún alimento que no toleres o prefieras evitar? <span className="text-xs font-normal text-muted-foreground">— opcional</span></Label>
          <Input
            id="restrictions"
            placeholder="Ej. lactosa, gluten, mariscos"
            {...register('q15_food_restrictions')}
          />
          <FieldError msg={errors.q15_food_restrictions?.message} />
        </div>
      </div>
    </>
  );
}

// ─── Step 5: Digestión y bienestar ────────────────────────────
function Step5Digestion({
  value,
  setValue,
  errors,
}: {
  value: { q6?: string; q11: string[]; q12?: string };
  setValue: FormSetValue;
  errors: FormErrors;
}) {
  return (
    <>
      <StepHeader
        title="Digestión y bienestar"
        description="Cómo te sientes en el día a día nos ayuda a personalizar tu plan."
      />

      <div className="flex flex-col gap-6">
        <ChoiceGroup
          label="¿Te sientes hinchado/a o inflamado/a durante el día?"
          options={[
            { value: 'si_constantemente', label: 'Sí, constantemente' },
            { value: 'a_veces', label: 'A veces' },
            { value: 'no', label: 'No' },
          ]}
          value={value.q6}
          onChange={(v) => setValue('q6_inflammation_perception', v as FormValues['q6_inflammation_perception'])}
          error={errors.q6_inflammation_perception?.message}
        />

        <CheckboxGroup
          label="¿Tienes alguno de estos síntomas digestivos? (puedes elegir varios)"
          options={[
            { value: 'gases', label: 'Gases' },
            { value: 'estrenimiento', label: 'Estreñimiento' },
            { value: 'digestion_pesada', label: 'Digestión pesada' },
            { value: 'ninguno', label: 'Ninguno' },
          ]}
          value={value.q11 as ('gases' | 'estrenimiento' | 'digestion_pesada' | 'ninguno')[]}
          onChange={(v) => setValue('q11_digestion_symptoms', v as FormValues['q11_digestion_symptoms'])}
          error={errors.q11_digestion_symptoms?.message}
        />

        <ChoiceGroup
          label="¿Cómo te sientes después de comer?"
          options={[
            { value: 'ligero', label: 'Ligero' },
            { value: 'pesado', label: 'Pesado' },
            { value: 'con_sueno', label: 'Con sueño' },
            { value: 'inflamado', label: 'Inflamado' },
          ]}
          value={value.q12}
          onChange={(v) => setValue('q12_post_meal_sensation', v as FormValues['q12_post_meal_sensation'])}
          error={errors.q12_post_meal_sensation?.message}
        />
      </div>
    </>
  );
}

// ─── Step 6: Dificultades y estrés ────────────────────────────
function Step6Estres({
  value,
  setValue,
  errors,
}: {
  value: { q4?: string; q14?: string };
  setValue: FormSetValue;
  errors: FormErrors;
}) {
  return (
    <>
      <StepHeader
        title="Tus dificultades y nivel de estrés"
        description="Esto nos ayuda a hacer un plan que realmente puedas sostener."
      />

      <div className="flex flex-col gap-6">
        <ChoiceGroup
          label="¿Cuál es tu mayor problema actualmente?"
          options={[
            { value: 'falta_tiempo', label: 'Falta de tiempo' },
            { value: 'ansiedad_hambre', label: 'Ansiedad / hambre' },
            { value: 'no_se_que_comer', label: 'No sé qué comer' },
            { value: 'falta_constancia', label: 'Falta de constancia' },
          ]}
          value={value.q4}
          onChange={(v) => setValue('q4_main_difficulty', v as FormValues['q4_main_difficulty'])}
          error={errors.q4_main_difficulty?.message}
        />

        <ChoiceGroup
          label="¿Cómo describirías tu nivel de estrés?"
          options={[
            { value: 'bajo', label: 'Bajo' },
            { value: 'medio', label: 'Medio' },
            { value: 'alto', label: 'Alto' },
          ]}
          value={value.q14}
          onChange={(v) => setValue('q14_stress_level', v as FormValues['q14_stress_level'])}
          error={errors.q14_stress_level?.message}
        />
      </div>
    </>
  );
}

// ─── Step 7: Resumen ──────────────────────────────────────────
function Step7Resumen({ values }: { values: FormValues }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Objetivo', value: 'Perder grasa' },
    { label: 'Edad / peso / talla', value: `${values.age ?? '–'} años · ${values.weight_kg ?? '–'} kg · ${values.height_cm ?? '–'} cm` },
    { label: 'Descripción física', value: prettyEnum(values.q2_body_description) },
    { label: 'Frecuencia de entrenamiento', value: prettyEnum(values.q3_training_frequency) },
    { label: 'Tipo de entrenamiento', value: prettyEnum(values.q9_training_type) },
    { label: 'Sueño', value: prettyEnum(values.q13_sleep_hours) },
    { label: 'Comidas al día', value: prettyEnum(values.q5_meals_per_day) },
    { label: 'Calidad de alimentación', value: prettyEnum(values.q10_food_quality) },
    { label: 'Inflamación percibida', value: prettyEnum(values.q6_inflammation_perception) },
    { label: 'Síntomas digestivos', value: (values.q11_digestion_symptoms ?? []).map(prettyEnum).join(', ') || '–' },
    { label: 'Después de comer', value: prettyEnum(values.q12_post_meal_sensation) },
    { label: 'Mayor dificultad', value: prettyEnum(values.q4_main_difficulty) },
    { label: 'Nivel de estrés', value: prettyEnum(values.q14_stress_level) },
  ];

  return (
    <>
      <StepHeader
        title="¡Listo! Revisa tus respuestas"
        description="Si todo está correcto, completa la evaluación. Después generaremos tu plan personalizado."
      />

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(({ label, value }, i) => (
              <tr key={label} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground" scope="row">{label}</th>
                <td className="px-4 py-2 text-foreground">{value || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Helper ───────────────────────────────────────────────────
function prettyEnum(value: string | undefined): string {
  if (!value) return '–';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
