import type { InputHTMLAttributes, ReactNode } from "react";

import { fieldStyles as styles } from "./field-classes";
import { Icon } from "./Icon";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  /** Botón dentro del campo, a la derecha (p. ej. mostrar contraseña). */
  action?: ReactNode;
};

export function TextField({
  name,
  label,
  hint,
  error,
  action,
  className,
  "aria-describedby": extraDescribedBy,
  ...input
}: TextFieldProps) {
  const id = `field-${name}`;
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`, extraDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          className={[styles.input, action && styles.withAction, className].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...input}
        />
        {action}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          <Icon name="alert" size={16} />
          {error}
        </p>
      )}
    </div>
  );
}
