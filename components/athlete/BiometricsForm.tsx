"use client";

import { useActionState } from "react";

import { formStyles as styles } from "@/components/app/page-classes";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import type { BiometricsField } from "@/lib/biometrics";
import type { FormState } from "@/lib/form-state";
import type { BiometricsRules } from "@/lib/validation";

import { BiometricsFields } from "./BiometricsFields";

type BiometricsAction = (previous: FormState<BiometricsField>, formData: FormData) => Promise<FormState<BiometricsField>>;

/** Formulario de la ficha propia: la misma UI para el alta obligatoria y para la edición. */
export function BiometricsForm({
  action,
  initial,
  today,
  rules,
  submitLabel,
  pendingLabel,
}: {
  action: BiometricsAction;
  initial?: Partial<Record<BiometricsField, string>>;
  today: string;
  rules: BiometricsRules;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state.notice && <FormAlert tone="success">{state.notice}</FormAlert>}
      <BiometricsFields values={state.values ?? initial} errors={state.fieldErrors} today={today} rules={rules} />
      <Button type="submit" block pending={pending} pendingLabel={pendingLabel} className={styles.submit}>
        {submitLabel}
      </Button>
    </form>
  );
}
