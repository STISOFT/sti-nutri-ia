'use client';

interface MacroProgressBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color: 'protein' | 'carbs' | 'fat' | 'calories';
}

const COLOR_CLASSES: Record<MacroProgressBarProps['color'], string> = {
  protein: 'bg-macro-protein',
  carbs: 'bg-macro-carbs',
  fat: 'bg-macro-fat',
  calories: 'bg-macro-calories',
};

export function MacroProgressBar({
  label,
  value,
  max,
  unit = 'g',
  color,
}: MacroProgressBarProps) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value}
          {unit} / {max}
          {unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${COLOR_CLASSES[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
