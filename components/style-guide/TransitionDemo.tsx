"use client";

import { startTransition, useState, ViewTransition } from "react";

import { LabButton } from "@/components/lab/Button";
import { ResultTag, type ResultTagProps } from "@/components/lab/ResultTag";

type Item = Omit<ResultTagProps, "action"> & { id: string; detail: string };

/**
 * La ficha se transforma en su detalle con View Transitions (React <ViewTransition>). Sin la API del
 * navegador, React aplica el cambio igual y sólo se pierde la animación.
 */
export function TransitionDemo({ items, labels }: { items: Item[]; labels: { open: string; close: string } }) {
  const [selected, setSelected] = useState<string | null>(null);
  const choose = (id: string | null) => startTransition(() => setSelected(id));
  const current = items.find((item) => item.id === selected);

  if (current) {
    return (
      <div className="grid gap-4">
        <ViewTransition name={`tag-${current.id}`} share="lab-morph" default="none">
          <div className="max-w-xl">
            <ResultTag {...current} />
          </div>
        </ViewTransition>
        <p className="max-w-prose text-base text-ink">{current.detail}</p>
        <div>
          <LabButton variant="secondary" icon="chevronLeft" onClick={() => choose(null)}>{labels.close}</LabButton>
        </div>
      </div>
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <ViewTransition name={`tag-${item.id}`} share="lab-morph" default="none">
            <div>
              <ResultTag
                {...item}
                action={<LabButton variant="quiet" icon="chevronRight" onClick={() => choose(item.id)}>{labels.open}</LabButton>}
              />
            </div>
          </ViewTransition>
        </li>
      ))}
    </ul>
  );
}
