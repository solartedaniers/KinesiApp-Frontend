"use client";

import { useActionState, useId } from "react";

import { Button } from "@/components/ui/Button";
import type { InlineResult } from "@/lib/actions/admin";
import { useT } from "@/lib/i18n/client";

import styles from "./InlineControls.module.css";

type InlineAction = (previous: InlineResult, formData: FormData) => Promise<InlineResult>;

/** Un <select> + guardar dentro de una fila de tabla (rol de un usuario, entrenador de un deportista). */
export function InlineSelectForm({
  name,
  label,
  options,
  defaultValue,
  placeholder,
  action,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  action: InlineAction;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, {});
  const id = useId();
  return (
    <form action={formAction} className={styles.form}>
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <select id={id} name={name} defaultValue={defaultValue ?? ""} className={styles.select} required>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="submit" variant="secondary" pending={pending} pendingLabel={t.common.saving} className={styles.button}>
        {t.admin.apply}
      </Button>
      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
