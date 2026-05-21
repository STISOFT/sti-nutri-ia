'use client';

import { useState } from 'react';
import {
  UtensilsIcon,
  DumbbellIcon,
  MoonIcon,
  DropletIcon,
  ZapIcon,
  FootprintsIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  HeartHandshakeIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { KodaPlanPdfButton } from '@/components/dashboard/KodaPlanPdfButton';
import type { KodaPlan, TrainingSession, NutritionIntervention } from '@/types/method';

interface KodaPlanViewProps {
  plan: KodaPlan;
  planId: string;
  userName?: string;
}

type Tab = 'nutrition' | 'training' | 'recovery';

const TABS: { id: Tab; label: string; icon: typeof UtensilsIcon }[] = [
  { id: 'nutrition', label: 'Nutrición', icon: UtensilsIcon },
  { id: 'training', label: 'Entrenamiento', icon: DumbbellIcon },
  { id: 'recovery', label: 'Recuperación', icon: HeartHandshakeIcon },
];

export function KodaPlanView({ plan, planId, userName }: KodaPlanViewProps) {
  const [tab, setTab] = useState<Tab>('nutrition');

  return (
    <div className="space-y-6">
      {/* Header con macros */}
      <PlanSummary plan={plan} planId={planId} userName={userName} />

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                tab === id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido del tab */}
      <div>
        {tab === 'nutrition' && <NutritionSection plan={plan} />}
        {tab === 'training' && <TrainingSection plan={plan} />}
        {tab === 'recovery' && <RecoverySection plan={plan} />}
      </div>
    </div>
  );
}

// ─── Resumen superior ──────────────────────────────────────────
function PlanSummary({
  plan,
  planId,
  userName,
}: {
  plan: KodaPlan;
  planId: string;
  userName?: string;
}) {
  const tierLabel: Record<KodaPlan['meta']['plan_tier'], string> = {
    inicio: 'PLAN INICIO',
    core: 'PLAN CORE',
    pro: 'PLAN PRO',
  };
  const followUpLabel: Record<KodaPlan['follow_up']['frequency'], string> = {
    sin_seguimiento: 'Sin seguimiento',
    semanal: 'Seguimiento semanal',
    quincenal: 'Seguimiento quincenal',
    mensual: 'Seguimiento mensual',
  };

  const avgKcal = Math.round(
    (plan.requirements.target_kcal.min + plan.requirements.target_kcal.max) / 2
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{tierLabel[plan.meta.plan_tier]}</Badge>
            <Badge variant="outline">{followUpLabel[plan.follow_up.frequency]}</Badge>
          </div>
          <KodaPlanPdfButton plan={plan} planId={planId} userName={userName} />
        </div>
        <CardTitle className="mt-2 font-display text-xl">
          Tu plan personalizado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MacroCard label="Calorías" value={`${avgKcal}`} unit="kcal/día" />
          <MacroCard label="Proteína" value={`${plan.requirements.protein_g}`} unit="g" />
          <MacroCard label="Carbohidratos" value={`${plan.requirements.carbs_g}`} unit="g" />
          <MacroCard label="Grasas" value={`${plan.requirements.fats_g}`} unit="g" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Déficit: {plan.requirements.deficit_type} · Rango{' '}
          {plan.requirements.target_kcal.min}–{plan.requirements.target_kcal.max} kcal
        </p>
      </CardContent>
    </Card>
  );
}

function MacroCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-foreground">
        {value}
        <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

// ─── Nutrición ─────────────────────────────────────────────────
function NutritionSection({ plan }: { plan: KodaPlan }) {
  const { nutrition } = plan;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsIcon className="size-5 text-primary" />
            Estructura del día
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <KeyValue label="Comidas al día" value={String(nutrition.meal_count)} />
          <Block label="Distribución diaria" text={nutrition.daily_distribution} />
          {nutrition.flexibility_notes && (
            <Block label="Flexibilidad" text={nutrition.flexibility_notes} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ZapIcon className="size-5 text-primary" />
            Distribución de macros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Block label="Proteína" text={nutrition.protein_distribution} />
          <Block label="Carbohidratos" text={nutrition.carbs_distribution} />
          <Block label="Grasas" text={nutrition.fats_distribution} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2Icon className="size-5 text-primary" />
            Alimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <FoodList
            label="Recomendados"
            items={nutrition.recommended_foods}
            variant="positive"
          />
          {nutrition.foods_to_avoid.length > 0 && (
            <FoodList
              label="A evitar"
              items={nutrition.foods_to_avoid}
              variant="negative"
            />
          )}
          {nutrition.food_notes && (
            <Block label="Notas" text={nutrition.food_notes} />
          )}
        </CardContent>
      </Card>

      {nutrition.interventions.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRightIcon className="size-5 text-primary" />
              Intervenciones específicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {nutrition.interventions.map((iv, i) => (
              <InterventionRow key={i} intervention={iv} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InterventionRow({ intervention }: { intervention: NutritionIntervention }) {
  return (
    <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-3">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-semibold text-foreground">{intervention.name}</span>
        <span className="text-xs text-muted-foreground">— {intervention.reason}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{intervention.how_to_apply}</p>
    </div>
  );
}

function FoodList({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: 'positive' | 'negative';
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-xs',
              variant === 'positive'
                ? 'border-primary/30 bg-primary/5 text-foreground'
                : 'border-destructive/30 bg-destructive/5 text-foreground'
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Entrenamiento ─────────────────────────────────────────────
function TrainingSection({ plan }: { plan: KodaPlan }) {
  const { training } = plan;
  const routineLabel: Record<typeof training.routine_type, string> = {
    full_body: 'Full Body',
    upper_lower: 'Upper / Lower',
    ppl_ul: 'PPL + Upper/Lower',
    ppl_x2: 'PPL x2',
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DumbbellIcon className="size-5 text-primary" />
            Estructura semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MacroCard
              label="Frecuencia"
              value={String(training.weekly_frequency)}
              unit="días/sem"
            />
            <MacroCard label="Rutina" value={routineLabel[training.routine_type]} unit="" />
            <MacroCard
              label="Duración"
              value={String(training.session_duration_min)}
              unit="min/sesión"
            />
            <MacroCard
              label="Cardio"
              value={training.cardio.type === 'ninguno' ? '—' : training.cardio.type.toUpperCase()}
              unit={training.cardio.type === 'ninguno' ? '' : `${training.cardio.weekly_frequency}x/sem`}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <CalendarClockIcon className="mr-1 inline size-3.5" />
            {training.weekly_distribution}
          </p>
        </CardContent>
      </Card>

      {/* Sesiones */}
      <div className="grid gap-4 md:grid-cols-2">
        {training.sessions.map((session, i) => (
          <SessionCard key={i} session={session} />
        ))}
      </div>

      {/* Cardio + Core */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cardio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {training.cardio.type === 'ninguno' ? (
              <p className="text-muted-foreground">No se incluye cardio adicional en este plan.</p>
            ) : (
              <>
                <KeyValue label="Tipo" value={training.cardio.type.toUpperCase()} />
                <KeyValue
                  label="Frecuencia"
                  value={`${training.cardio.weekly_frequency} veces/semana`}
                />
                <KeyValue label="Duración" value={`${training.cardio.duration_min} min`} />
                <Block label="Cuándo" text={training.cardio.placement} />
                {training.cardio.notes && <Block label="Notas" text={training.cardio.notes} />}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Core</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <KeyValue
              label="Frecuencia"
              value={`${training.core.weekly_frequency} veces/semana`}
            />
            <KeyValue label="Total series" value={`${training.core.total_weekly_series}/semana`} />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ejercicios
            </p>
            <ul className="space-y-1">
              {training.core.exercises.map((ex, i) => (
                <li key={i} className="text-foreground">
                  • {ex}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {training.interventions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas del entrenamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {training.interventions.map((iv, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ArrowRightIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>{iv}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SessionCard({ session }: { session: TrainingSession }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{session.day_label}</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-2 text-left font-medium">Ejercicio</th>
              <th className="pb-2 text-center font-medium">Series</th>
              <th className="pb-2 text-center font-medium">Reps</th>
              <th className="pb-2 text-center font-medium">RIR</th>
            </tr>
          </thead>
          <tbody>
            {session.exercises.map((ex, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-2">
                  <div className="font-medium text-foreground">{ex.name}</div>
                  <Badge variant="outline" className="mt-0.5 text-[10px]">
                    {ex.category}
                  </Badge>
                </td>
                <td className="text-center text-foreground">{ex.series}</td>
                <td className="text-center text-foreground">{ex.reps}</td>
                <td className="text-center text-muted-foreground">{ex.rir}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ─── Recuperación ──────────────────────────────────────────────
function RecoverySection({ plan }: { plan: KodaPlan }) {
  const { recovery } = plan;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MoonIcon className="size-5 text-primary" />
            Sueño
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <KeyValue label="Objetivo" value={recovery.sleep.target_hours} />
          <p className="text-muted-foreground">{recovery.sleep.recommendation}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DropletIcon className="size-5 text-primary" />
            Hidratación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <KeyValue label="Meta diaria" value={`${recovery.hydration.daily_target_ml} ml`} />
          {recovery.hydration.notes && (
            <p className="text-muted-foreground">{recovery.hydration.notes}</p>
          )}
          {recovery.hydration.interventions.length > 0 && (
            <Tags items={recovery.hydration.interventions} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FootprintsIcon className="size-5 text-primary" />
            Actividad diaria (NEAT)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <KeyValue
            label="Pasos al día"
            value={recovery.neat.daily_steps_target.toLocaleString('es-PE')}
          />
          <ul className="space-y-1">
            {recovery.neat.recommendations.map((r, i) => (
              <li key={i} className="text-muted-foreground">
                • {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartHandshakeIcon className="size-5 text-primary" />
            Manejo del estrés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">{recovery.stress.recommendation}</p>
          {recovery.stress.interventions.length > 0 && (
            <Tags items={recovery.stress.interventions} />
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Organización y adherencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">{recovery.organization.recommendation}</p>
          {recovery.organization.practical_tips.length > 0 && (
            <>
              <Separator />
              <ul className="space-y-1.5">
                {recovery.organization.practical_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────
function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-foreground">{text}</p>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <span
          key={i}
          className="inline-flex rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs text-foreground"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
