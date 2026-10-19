import type { ReactNode } from "react";

import { LabIcon } from "./LabIcon";

import type { LabIconName } from "@/lib/design/icons";

export type ResultTagProps = {
  movementIcon: LabIconName;
  movement: string;
  date: string;
  metric: string;
  metricLabel: string;
  rows: { label: string; value: ReactNode }[];
  action?: ReactNode;
};

const styles = {
  // Etiqueta de muestra de laboratorio: esquina cortada, ojal para el cordel y un talón perforado
  tag: "lab-tag relative grid gap-4 bg-panel p-5 pl-9 text-ink",
  head: "flex items-center gap-2 text-sm text-ink-muted",
  movement: "font-semibold text-ink",
  metric: "grid gap-0.5",
  metricValue: "font-mono text-5xl font-medium leading-none tracking-[-0.03em] [font-variant-numeric:tabular-nums]",
  metricLabel: "text-sm text-ink-muted",
  rows: "grid gap-2 border-t border-dashed border-line-strong pt-4 text-sm",
  row: "flex items-center justify-between gap-4",
  rowLabel: "text-ink-muted",
  rowValue: "text-right font-semibold",
};

/** Ficha de un análisis con la cifra principal grande y sus datos en filas. */
export function ResultTag({ movementIcon, movement, date, metric, metricLabel, rows, action }: ResultTagProps) {
  return (
    <article className={styles.tag}>
      <p className={styles.head}>
        <LabIcon name={movementIcon} size={18} />
        <span className={styles.movement}>{movement}</span>
        <span aria-hidden>·</span>
        <time>{date}</time>
      </p>
      <p className={styles.metric}>
        <span className={styles.metricValue}>{metric}</span>
        <span className={styles.metricLabel}>{metricLabel}</span>
      </p>
      <dl className={styles.rows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <dt className={styles.rowLabel}>{row.label}</dt>
            <dd className={styles.rowValue}>{row.value}</dd>
          </div>
        ))}
      </dl>
      {action}
    </article>
  );
}
