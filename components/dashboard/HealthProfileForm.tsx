'use client';

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SaveIcon, SparklesIcon, Loader2Icon, PlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fullHealthProfileSchema } from '@/lib/validations/health-profile';
import type { HealthProfileInput } from '@/lib/validations/health-profile';
import type { UserHealthProfile } from '@/types/database';

interface HealthProfileFormProps {
  initialData: UserHealthProfile | null;
}

const GOAL_OPTIONS = [
  { value: 'perder_peso', label: 'Perder peso' },
  { value: 'ganar_peso', label: 'Ganar peso' },
  { value: 'mantener_peso', label: 'Mantener el peso' },
  { value: 'ganar_musculo', label: 'Ganar músculo' },
];

const ACTIVITY_OPTIONS = [
  { value: 'sedentario', label: 'Sedentario (poco o ningún ejercicio)' },
  { value: 'ligero', label: 'Actividad ligera (1-3 días/semana)' },
  { value: 'moderado', label: 'Moderado (3-5 días/semana)' },
  { value: 'activo', label: 'Activo (6-7 días/semana)' },
  { value: 'muy_activo', label: 'Muy activo (ejercicio intenso diario)' },
];

function TagsField({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const value = input.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={addTag}>
          <PlusIcon className="size-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function HealthProfileForm({ initialData }: HealthProfileFormProps) {
  const router = useRouter();
  const [regenerating, setRegenerating] = useState(false);

  const [preferredFoods, setPreferredFoods] = useState<string[]>(
    initialData?.preferred_foods ?? []
  );
  const [avoidedFoods, setAvoidedFoods] = useState<string[]>(
    initialData?.avoided_foods ?? []
  );
  const [allergies, setAllergies] = useState<string[]>(
    initialData?.food_allergies ?? []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HealthProfileInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(fullHealthProfileSchema) as Resolver<HealthProfileInput>,
    defaultValues: {
      age: initialData?.age,
      weight_kg: initialData?.weight_kg,
      height_cm: initialData?.height_cm,
      goal: initialData?.goal as HealthProfileInput['goal'],
      activity_level: initialData?.activity_level as HealthProfileInput['activity_level'],
      preferred_foods: initialData?.preferred_foods ?? [],
      avoided_foods: initialData?.avoided_foods ?? [],
      food_allergies: initialData?.food_allergies ?? [],
      medical_conditions: initialData?.medical_conditions ?? '',
    },
  });

  const goal = watch('goal');
  const activityLevel = watch('activity_level');

  const onSubmit = async (data: HealthProfileInput) => {
    const payload = {
      ...data,
      preferred_foods: preferredFoods,
      avoided_foods: avoidedFoods,
      food_allergies: allergies,
    };

    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success('Perfil actualizado correctamente');
      router.refresh();
    } else {
      toast.error('Error al guardar el perfil. Intenta de nuevo.');
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    const payload = {
      ...watch(),
      preferred_foods: preferredFoods,
      avoided_foods: avoidedFoods,
      food_allergies: allergies,
    };

    try {
      const res = await fetch('/api/diet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120_000),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Error al regenerar el plan');
        return;
      }

      toast.success('¡Nuevo plan generado! Redirigiendo...');
      router.push('/mi-plan');
    } catch {
      toast.error('Tiempo de espera agotado. Intenta de nuevo.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos físicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos físicos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="age">Edad</Label>
            <div className="relative">
              <Input id="age" type="number" {...register('age')} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                años
              </span>
            </div>
            {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weight_kg">Peso</Label>
            <div className="relative">
              <Input id="weight_kg" type="number" step="0.1" {...register('weight_kg')} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                kg
              </span>
            </div>
            {errors.weight_kg && (
              <p className="text-xs text-destructive">{errors.weight_kg.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="height_cm">Estatura</Label>
            <div className="relative">
              <Input id="height_cm" type="number" {...register('height_cm')} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                cm
              </span>
            </div>
            {errors.height_cm && (
              <p className="text-xs text-destructive">{errors.height_cm.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objetivo y actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Objetivo y actividad</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Objetivo</Label>
            <Select
              value={goal}
              onValueChange={(v) => setValue('goal', v as HealthProfileInput['goal'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu objetivo" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.goal && <p className="text-xs text-destructive">{errors.goal.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Nivel de actividad</Label>
            <Select
              value={activityLevel}
              onValueChange={(v) =>
                setValue('activity_level', v as HealthProfileInput['activity_level'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu nivel" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activity_level && (
              <p className="text-xs text-destructive">{errors.activity_level.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferencias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferencias alimentarias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagsField
            label="Alimentos preferidos"
            tags={preferredFoods}
            onChange={setPreferredFoods}
            placeholder="Ej: quinua, pollo, palta…"
          />
          <TagsField
            label="Alimentos a evitar"
            tags={avoidedFoods}
            onChange={setAvoidedFoods}
            placeholder="Ej: carne roja, azúcar…"
          />
          <TagsField
            label="Alergias"
            tags={allergies}
            onChange={setAllergies}
            placeholder="Ej: gluten, lactosa…"
          />
          <div className="space-y-1.5">
            <Label htmlFor="medical_conditions">Condiciones médicas</Label>
            <Textarea
              id="medical_conditions"
              rows={3}
              placeholder="Ej: diabetes tipo 2, hipertensión…"
              {...register('medical_conditions')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" variant="outline" className="gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SaveIcon className="size-4" />
          )}
          Guardar cambios
        </Button>
        <Button
          type="button"
          className="gap-2"
          onClick={handleRegenerate}
          disabled={regenerating || isSubmitting}
        >
          {regenerating ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SparklesIcon className="size-4" />
          )}
          {regenerating ? 'Generando plan...' : 'Guardar y regenerar plan'}
        </Button>
      </div>
    </form>
  );
}
