'use client';

import {
  ClockIcon,
  ChefHatIcon,
  LightbulbIcon,
  FlameIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MacroProgressBar } from './MacroProgressBar';
import { ShoppingList } from './ShoppingList';
import { PdfDownloadButton } from './PdfDownloadButton';
import type { DietPlanData, DietDay, MealItem } from '@/types/database';

const MEAL_LABELS: Record<string, string> = {
  desayuno: 'Desayuno',
  media_manana: 'Media mañana',
  almuerzo: 'Almuerzo',
  media_tarde: 'Media tarde',
  cena: 'Cena',
};

const MEAL_ORDER = ['desayuno', 'media_manana', 'almuerzo', 'media_tarde', 'cena'];

function MealCard({ name, meal }: { name: string; meal: MealItem }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {MEAL_LABELS[name] ?? name}
          </p>
          <p className="font-medium text-foreground leading-tight">{meal.name}</p>
        </div>
        <Badge variant="outline" className="shrink-0 gap-1 text-xs">
          <FlameIcon className="size-3 text-orange-500" />
          {meal.calories} kcal
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{meal.description}</p>
      <div className="flex flex-wrap gap-1">
        {meal.ingredients.map((ing, i) => (
          <span
            key={i}
            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {ing}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ClockIcon className="size-3" />
        {meal.prep_time_min} min de preparación
      </div>
    </div>
  );
}

function DayCard({ day }: { day: DietDay }) {
  return (
    <AccordionItem value={`day-${day.day}`} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3 text-left">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {day.day}
          </span>
          <div>
            <p className="font-medium text-foreground leading-none">{day.day_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {day.total_calories?.toLocaleString()} kcal totales
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 pb-4">
        {/* Consejo del día */}
        <div className="flex items-start gap-2 rounded-md bg-primary/5 p-2.5 text-sm">
          <LightbulbIcon className="size-4 shrink-0 text-primary mt-0.5" />
          <p className="text-muted-foreground">{day.daily_tip}</p>
        </div>
        {/* Comidas */}
        <div className="space-y-2">
          {MEAL_ORDER.map((mealKey) => {
            const meal = (day.meals as unknown as Record<string, MealItem>)[mealKey];
            if (!meal) return null;
            return <MealCard key={mealKey} name={mealKey} meal={meal} />;
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface DietPlanViewProps {
  planData: DietPlanData;
  planId: string;
}

export function DietPlanView({ planData, planId }: DietPlanViewProps) {
  const { summary, weeks } = planData;

  return (
    <div className="space-y-6">
      {/* Resumen de macros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ChefHatIcon className="size-5 text-primary" />
              Resumen del plan
            </CardTitle>
            <PdfDownloadButton planData={planData} planId={planId} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{summary.notes}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <MacroProgressBar
              label="Calorías"
              value={summary.calories_per_day}
              max={summary.calories_per_day}
              unit=" kcal"
              color="calories"
            />
            <MacroProgressBar
              label="Agua"
              value={summary.water_ml}
              max={summary.water_ml}
              unit=" ml"
              color="carbs"
            />
            <MacroProgressBar
              label="Proteínas"
              value={summary.protein_g}
              max={summary.protein_g}
              color="protein"
            />
            <MacroProgressBar
              label="Carbohidratos"
              value={summary.carbs_g}
              max={summary.carbs_g}
              color="carbs"
            />
            <MacroProgressBar
              label="Grasas"
              value={summary.fat_g}
              max={summary.fat_g}
              color="fat"
            />
          </div>
        </CardContent>
      </Card>

      {/* Semanas */}
      <Tabs defaultValue="1">
        <TabsList className="grid w-full grid-cols-4">
          {weeks.map((week) => (
            <TabsTrigger key={week.week_number} value={String(week.week_number)}>
              Sem {week.week_number}
            </TabsTrigger>
          ))}
        </TabsList>

        {weeks.map((week) => (
          <TabsContent key={week.week_number} value={String(week.week_number)} className="space-y-4 mt-4">
            {/* Tema de la semana */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium text-primary">{week.theme}</p>
            </div>

            {/* Días */}
            <Accordion className="space-y-2">
              {week.days.map((day) => (
                <DayCard key={day.day} day={day} />
              ))}
            </Accordion>

            {/* Lista de compras */}
            <Card>
              <CardContent className="pt-5">
                <ShoppingList items={week.shopping_list} weekNumber={week.week_number} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
