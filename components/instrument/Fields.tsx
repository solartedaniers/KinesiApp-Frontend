import { type ComponentProps, useId } from "react";

import { Glyph } from "./Glyph";

const styles = {
  field: "grid gap-1.5",
  label: "text-sm font-semibold text-ink",
  box: "kin-field flex min-h-11 items-center gap-2 px-3",
  input: "min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink-muted",
  hint: "text-sm text-ink-muted",
  error: "flex items-start gap-1.5 text-sm font-semibold text-ink",
  choice: "flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink",
};

/** Campo de texto con ayuda y error enlazados por aria-describedby. */
export function TextField({ label, hint, error, ...props }: { label: string; hint?: string; error?: string } & ComponentProps<"input">) {
  const id = useId();
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.box}>
        <input id={id} className={styles.input} aria-invalid={error ? true : undefined} aria-describedby={described} {...props} />
        {error && <Glyph name="alert" size={18} className="text-ink" />}
      </div>
      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  );
}

export function Checkbox({ label, ...props }: { label: string } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label className={styles.choice}>
      <input type="checkbox" className="peer visually-hidden" {...props} />
      <span className="kin-check-box grid size-6 flex-none place-items-center rounded-control text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" aria-hidden>
        <svg viewBox="0 0 16 16" className="size-4"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" pathLength={1} className="fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span>{label}</span>
    </label>
  );
}

/** Interruptor nativo: un checkbox con role="switch", así funciona con teclado y sin JavaScript. */
export function Switch({ label, ...props }: { label: string } & Omit<ComponentProps<"input">, "type" | "role">) {
  return (
    <label className={`${styles.choice} justify-between`}>
      <span>{label}</span>
      <input type="checkbox" role="switch" className="peer visually-hidden" {...props} />
      <span className="kin-switch-track flex h-7 w-12 flex-none items-center rounded-full p-0.5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" aria-hidden>
        <span className="kin-switch-knob size-6 rounded-full" />
      </span>
    </label>
  );
}
