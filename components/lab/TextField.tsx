import type { InputHTMLAttributes } from "react";

import { LabIcon } from "./LabIcon";

const styles = {
  field: "grid gap-1.5",
  label: "text-sm font-semibold text-ink",
  control: "lab-field relative flex items-center rounded-tag bg-panel shadow-[inset_0_0_0_1px_var(--kin-line-strong)] has-[[aria-invalid=true]]:shadow-[inset_0_0_0_2px_var(--kin-ink)]",
  input: "min-h-11 w-full min-w-0 bg-transparent px-3 text-base text-ink outline-none placeholder:text-ink-muted",
  unit: "pr-3 text-sm text-ink-muted",
  hint: "text-sm text-ink-muted",
  // Sin rojo: el rojo sólo significa riesgo. El error se distingue por el ícono, el peso y el borde doble
  error: "flex items-start gap-1.5 text-sm font-semibold text-ink [&_svg]:mt-px [&_svg]:flex-none",
};

export type LabTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  unit?: string;
};

/** Campo con etiqueta visible; al enfocarlo, una regla de cobalto se extiende bajo el texto. */
export function LabTextField({ name, label, hint, error, unit, id = `field-${name}`, ...input }: LabTextFieldProps) {
  const describedBy = [hint && !error && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <input id={id} name={name} className={styles.input} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
        {unit && <span className={styles.unit} aria-hidden>{unit}</span>}
      </div>
      {hint && !error && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          <LabIcon name="alert" size={16} />
          {error}
        </p>
      )}
    </div>
  );
}
