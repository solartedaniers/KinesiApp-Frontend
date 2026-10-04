"use client";

import { useActionState } from "react";

import { BiometricsFields } from "@/components/athlete/BiometricsFields";
import styles from "@/components/auth/AuthForm.module.css";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { FullNameField } from "@/components/ui/FullNameField";
import type { ManagedAthleteField } from "@/lib/actions/managed-athletes";
import type { FormState } from "@/lib/form-state";

type ManagedAthleteAction = (
  previous: FormState<ManagedAthleteField>,
  formData: FormData,
) => Promise<FormState<ManagedAthleteField>>;

/** Alta y edición de un deportista sin cuenta: nombre y ficha, sin correo ni contraseña. */
export function ManagedAthleteForm({
  action,
  initial,
  today,
  submitLabel,
  pendingLabel,
}: {
  action: ManagedAthleteAction;
  initial?: Partial<Record<ManagedAthleteField, string>>;
  today: string;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? initial;

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <FullNameField defaultValue={values?.full_name} error={state.fieldErrors?.full_name} autoComplete="off" />
      <BiometricsFields values={values} errors={state.fieldErrors} today={today} />
      <Button type="submit" block pending={pending} pendingLabel={pendingLabel} className={styles.submit}>
        {submitLabel}
      </Button>
    </form>
  );
}
