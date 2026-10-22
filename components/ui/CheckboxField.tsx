import type { InputHTMLAttributes, ReactNode } from "react";

import { fieldStyles } from "./field-classes";

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { name: string; error?: string; children: ReactNode };

/** Checkbox nativo con la caja del instrumento; el texto puede llevar enlaces (por eso es `children`). */
export function CheckboxField({ name, error, children, ...input }: CheckboxFieldProps) {
  const errorId = `field-${name}-error`;
  return (
    <div className="grid gap-1.5">
      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name={name}
          className="peer visually-hidden"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...input}
        />
        <span className="kin-check-box grid size-6 flex-none place-items-center rounded-control text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" aria-hidden>
          <svg viewBox="0 0 16 16" className="size-4">
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" pathLength={1} className="fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="pt-0.5">{children}</span>
      </label>
      {error && (
        <p id={errorId} className={fieldStyles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
