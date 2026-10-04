"use client";

import { useActionState } from "react";

import styles from "@/components/auth/AuthForm.module.css";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import type { BiometricsField } from "@/lib/biometrics";
import type { FormState } from "@/lib/form-state";

import { BiometricsFields } from "./BiometricsFields";

type BiometricsAction = (previous: FormState<BiometricsField>, formData: FormData) => Promise<FormState<BiometricsField>>;

/** Formulario de la ficha propia: la misma UI para el alta obligatoria y para la edición. */
export function BiometricsForm({
  action,
  initial,
  today,
  submitLabel,
  pendingLabel,
}: {
  action: BiometricsAction;
  initial?: Partial<Record<BiometricsField, string>>;
  today: string;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state.notice && <FormAlert tone="success">{state.notice}</FormAlert>}
      <BiometricsFields values={state.values ?? initial} errors={state.fieldErrors} today={today} />
      <Button type="submit" block pending={pending} pendingLabel={pendingLabel} className={styles.submit}>
        {submitLabel}
      </Button>
    </form>
  );
}
