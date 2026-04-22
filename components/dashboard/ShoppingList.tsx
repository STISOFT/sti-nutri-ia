'use client';

import { useState } from 'react';
import { ShoppingCartIcon, CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ShoppingListProps {
  items: string[];
  weekNumber: number;
}

export function ShoppingList({ items, weekNumber }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const resetAll = () => setChecked(new Set());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="size-4 text-primary" />
          <span className="font-semibold text-foreground">Lista de compras — Semana {weekNumber}</span>
          <Badge variant="secondary">{items.length} items</Badge>
        </div>
        {checked.size > 0 && (
          <button
            onClick={resetAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Limpiar
          </button>
        )}
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/60 transition-colors"
            >
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  checked.has(i)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background'
                }`}
              >
                {checked.has(i) && <CheckIcon className="size-3" />}
              </span>
              <span
                className={
                  checked.has(i)
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground'
                }
              >
                {item}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
