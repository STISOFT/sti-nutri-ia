'use client';

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  ActivityIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  Loader2Icon,
  XIcon,
  PlusIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import { step1Schema, step2Schema, step3Schema } from '@/lib/validations/health-profile';
import type { Step1Input, Step2Input, Step3Input } from '@/lib/validations/health-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ── Sugerencias de alimentos peruanos ────────────────────────
const PERUVIAN_FOOD_SUGGESTIONS = [
  'Quinua', 'Kiwicha', 'Arroz', 'Papa', 'Camote', 'Yuca', 'Choclo',
  'Pollo', 'Pescado', 'Carne de res', 'Lenteja', 'Frijol', 'Garbanzo',
  'Palta', 'Plátano', 'Mango', 'Papaya', 'Piña', 'Naranja', 'Lúcuma',
  'Leche', 'Huevo', 'Yogur', 'Queso', 'Tomate', 'Cebolla', 'Ajo',
];

const ALLERGY_SUGGESTIONS = [
  'Gluten', 'Lactosa', 'Mariscos', 'Frutos secos', 'Huevo', 'Soya',
  'Maní', 'Pescado', 'Trigo', 'Nueces',
];

// ── Opciones de objetivo ──────────────────────────────────────
const GOAL_OPTIONS = [
  { value: 'perder_peso', label: 'Perder peso', emoji: '📉', desc: 'Reducir grasa corporal de forma saludable' },
  { value: 'ganar_peso', label: 'Ganar peso', emoji: '📈', desc: 'Aumentar masa y peso de manera controlada' },
  { value: 'mantener_peso', label: 'Mantener peso', emoji: '⚖️', desc: 'Conservar mi peso actual con buena nutrición' },
  { value: 'ganar_musculo', label: 'Ganar músculo', emoji: '💪', desc: 'Aumentar masa muscular y definición' },
] as const;

// ── Opciones de actividad ─────────────────────────────────────
const ACTIVITY_OPTIONS = [
  { value: 'sedentario', label: 'Sedentario', desc: 'Trabajo de oficina, poco movimiento' },
  { value: 'ligero', label: 'Actividad ligera', desc: 'Ejercicio 1-3 días por semana' },
  { value: 'moderado', label: 'Actividad moderada', desc: 'Ejercicio 3-5 días por semana' },
  { value: 'activo', label: 'Activo', desc: 'Ejercicio 6-7 días por semana' },
  { value: 'muy_activo', label: 'Muy activo', desc: 'Ejercicio intenso diario o trabajo físico' },
] as const;

// ── Componente de tag input ───────────────────────────────────
function TagInput({
  tags,
  onAdd,
  onRemove,
  suggestions,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  const unusedSuggestions = suggestions.filter((s) => !tags.includes(s)).slice(0, 6);

  return (
    <div className="flex flex-col gap-2">
      {/* Tags seleccionados */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="text-primary/60 hover:text-primary"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-9"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => handleAdd(inputValue)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <PlusIcon className="size-4" />
          </button>
        )}
      </div>

      {/* Sugerencias rápidas */}
      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {unusedSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onAdd(s)}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pantalla de generación ────────────────────────────────────
function GeneratingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
      <div className="relative">
        {/* Animación de plato */}
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <ActivityIcon className="size-10 animate-pulse text-primary" />
        </div>
        <div className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary">
          <Loader2Icon className="size-3.5 animate-spin text-primary-foreground" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Generando tu plan personalizado...
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Nuestra IA está creando 4 semanas de recetas peruanas adaptadas a tu perfil.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Esto puede tomar hasta 60 segundos
        </p>
      </div>

      {/* Indicadores de progreso visual */}
      <div className="flex flex-col gap-2 text-left text-sm text-muted-foreground w-full max-w-xs">
        {[
          'Analizando tu perfil y objetivos',
          'Calculando macronutrientes ideales',
          'Seleccionando ingredientes peruanos',
          'Creando 140 recetas personalizadas',
          'Generando listas de compras semanales',
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <Loader2Icon className="size-3.5 shrink-0 animate-spin text-primary" style={{ animationDelay: `${i * 0.2}s` }} />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Wizard principal ──────────────────────────────────────────
type WizardStep = 1 | 2 | 3 | 'generating';

interface AccumulatedData {
  step1: Step1Input | null;
  step2: Step2Input | null;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [accumulated, setAccumulated] = useState<AccumulatedData>({
    step1: null,
    step2: null,
  });

  // ── Tags state para paso 3 ────────────────────────────────
  const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
  const [avoidedFoods, setAvoidedFoods] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  // ── Forms por paso ────────────────────────────────────────
  const form1 = useForm<Step1Input>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step1Schema) as Resolver<Step1Input>,
    defaultValues: { age: undefined, weight_kg: undefined, height_cm: undefined },
  });

  const form2 = useForm<Step2Input>({
    resolver: zodResolver(step2Schema),
    defaultValues: { goal: undefined, activity_level: undefined },
  });

  const form3 = useForm<Step3Input>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step3Schema) as Resolver<Step3Input>,
    defaultValues: { medical_conditions: '' },
  });

  // ── Paso 1 submit ─────────────────────────────────────────
  const onStep1Submit = (data: Step1Input) => {
    setAccumulated((prev) => ({ ...prev, step1: data }));
    setCurrentStep(2);
  };

  // ── Paso 2 submit ─────────────────────────────────────────
  const onStep2Submit = (data: Step2Input) => {
    setAccumulated((prev) => ({ ...prev, step2: data }));
    setCurrentStep(3);
  };

  // ── Paso 3 submit + llamada a API ─────────────────────────
  const onStep3Submit = async (data: Step3Input) => {
    if (!accumulated.step1 || !accumulated.step2) return;

    const payload = {
      ...accumulated.step1,
      ...accumulated.step2,
      preferred_foods: preferredFoods,
      avoided_foods: avoidedFoods,
      food_allergies: allergies,
      medical_conditions: data.medical_conditions || '',
    };

    setCurrentStep('generating');

    try {
      const res = await fetch('/api/diet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120_000), // 120s timeout en el cliente
      });

      if (!res.ok) {
        const error = await res.json() as { error?: string };
        throw new Error(error.error ?? 'Error al generar el plan');
      }

      toast.success('¡Tu plan de alimentación está listo!');
      router.push('/mi-plan');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado';
      toast.error(message);
      setCurrentStep(3);
    }
  };

  // ── Pantalla de generando ─────────────────────────────────
  if (currentStep === 'generating') {
    return <GeneratingScreen />;
  }

  // ── Barra de progreso ─────────────────────────────────────
  const stepNumber = currentStep as 1 | 2 | 3;
  const progress = (stepNumber / 3) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Progreso */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Paso {stepNumber} de 3</span>
          <span className="text-muted-foreground">
            {stepNumber === 1 && 'Datos físicos'}
            {stepNumber === 2 && 'Objetivo y actividad'}
            {stepNumber === 3 && 'Preferencias alimentarias'}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Indicadores de paso */}
        <div className="mt-2 flex justify-between">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                n < stepNumber
                  ? 'bg-primary text-primary-foreground'
                  : n === stepNumber
                  ? 'border-2 border-primary text-primary'
                  : 'border border-muted text-muted-foreground'
              }`}
            >
              {n < stepNumber ? <CheckCircle2Icon className="size-4" /> : n}
            </div>
          ))}
        </div>
      </div>

      {/* ── PASO 1: Datos físicos ─────────────────────────────── */}
      {currentStep === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1Submit)} className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tus datos físicos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta información nos permite calcular tus macronutrientes ideales.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Edad */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="age">Edad</Label>
              <div className="relative">
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  aria-invalid={!!form1.formState.errors.age}
                  className="pr-12"
                  {...form1.register('age')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">años</span>
              </div>
              {form1.formState.errors.age && (
                <p className="text-xs text-destructive">{form1.formState.errors.age.message}</p>
              )}
            </div>

            {/* Peso y Estatura en fila */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weight">Peso</Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    aria-invalid={!!form1.formState.errors.weight_kg}
                    className="pr-8"
                    {...form1.register('weight_kg')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
                </div>
                {form1.formState.errors.weight_kg && (
                  <p className="text-xs text-destructive">{form1.formState.errors.weight_kg.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="height">Estatura</Label>
                <div className="relative">
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    aria-invalid={!!form1.formState.errors.height_cm}
                    className="pr-8"
                    {...form1.register('height_cm')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
                </div>
                {form1.formState.errors.height_cm && (
                  <p className="text-xs text-destructive">{form1.formState.errors.height_cm.message}</p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="mt-2 w-full gap-2">
            Siguiente
            <ChevronRightIcon className="size-4" />
          </Button>
        </form>
      )}

      {/* ── PASO 2: Objetivo y actividad ─────────────────────── */}
      {currentStep === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2Submit)} className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tu objetivo y actividad</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona tu meta principal y tu nivel de actividad física actual.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Objetivo */}
            <div className="flex flex-col gap-2">
              <Label>¿Cuál es tu objetivo?</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {GOAL_OPTIONS.map((option) => {
                  const selected = form2.watch('goal') === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => form2.setValue('goal', option.value, { shouldValidate: true })}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        selected
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {form2.formState.errors.goal && (
                <p className="text-xs text-destructive">{form2.formState.errors.goal.message}</p>
              )}
            </div>

            {/* Nivel de actividad */}
            <div className="flex flex-col gap-2">
              <Label>Nivel de actividad física</Label>
              <div className="flex flex-col gap-1.5">
                {ACTIVITY_OPTIONS.map((option) => {
                  const selected = form2.watch('activity_level') === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        form2.setValue('activity_level', option.value, { shouldValidate: true })
                      }
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                      {selected && (
                        <div className="shrink-0 ml-2 size-4 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
              {form2.formState.errors.activity_level && (
                <p className="text-xs text-destructive">
                  {form2.formState.errors.activity_level.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setCurrentStep(1)}
            >
              <ChevronLeftIcon className="size-4" />
              Atrás
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              Siguiente
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </form>
      )}

      {/* ── PASO 3: Preferencias alimentarias ────────────────── */}
      {currentStep === 3 && (
        <form onSubmit={form3.handleSubmit(onStep3Submit)} className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tus preferencias alimentarias</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Personaliza aún más tu plan indicando lo que te gusta y lo que debes evitar.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Alimentos preferidos */}
            <div className="flex flex-col gap-1.5">
              <Label>Alimentos que te gustan</Label>
              <p className="text-xs text-muted-foreground">
                Escribe y presiona Enter, o selecciona de las sugerencias
              </p>
              <TagInput
                tags={preferredFoods}
                onAdd={(t) => setPreferredFoods((prev) => [...prev, t])}
                onRemove={(t) => setPreferredFoods((prev) => prev.filter((f) => f !== t))}
                suggestions={PERUVIAN_FOOD_SUGGESTIONS}
                placeholder="Ej: Quinua, Pollo, Palta..."
              />
            </div>

            {/* Alimentos a evitar */}
            <div className="flex flex-col gap-1.5">
              <Label>Alimentos que no consumes</Label>
              <p className="text-xs text-muted-foreground">
                Preferencias, restricciones religiosas, dieta vegetariana, etc.
              </p>
              <TagInput
                tags={avoidedFoods}
                onAdd={(t) => setAvoidedFoods((prev) => [...prev, t])}
                onRemove={(t) => setAvoidedFoods((prev) => prev.filter((f) => f !== t))}
                suggestions={PERUVIAN_FOOD_SUGGESTIONS}
                placeholder="Ej: Carne roja, Cerdo..."
              />
            </div>

            {/* Alergias */}
            <div className="flex flex-col gap-1.5">
              <Label>Alergias o intolerancias</Label>
              <p className="text-xs text-muted-foreground">
                Estos ingredientes nunca aparecerán en tu plan
              </p>
              <TagInput
                tags={allergies}
                onAdd={(t) => setAllergies((prev) => [...prev, t])}
                onRemove={(t) => setAllergies((prev) => prev.filter((f) => f !== t))}
                suggestions={ALLERGY_SUGGESTIONS}
                placeholder="Ej: Gluten, Lactosa, Mariscos..."
              />
            </div>

            {/* Condiciones médicas */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="medical">Condiciones médicas relevantes</Label>
              <p className="text-xs text-muted-foreground">
                Diabetes, hipertensión, colesterol alto, etc. (opcional)
              </p>
              <textarea
                id="medical"
                rows={2}
                placeholder="Ej: Diabetes tipo 2, hipertensión arterial..."
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                {...form3.register('medical_conditions')}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setCurrentStep(2)}
            >
              <ChevronLeftIcon className="size-4" />
              Atrás
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={form3.formState.isSubmitting}
            >
              {form3.formState.isSubmitting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  Generar mi plan
                  <ChevronRightIcon className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
