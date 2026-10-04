"use client";

import { useActionState } from "react";

import styles from "@/components/auth/AuthForm.module.css";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { FullNameField } from "@/components/ui/FullNameField";
import { updateMyName } from "@/lib/actions/profile";
import { useT } from "@/lib/i18n/client";

/** Nombre de la cuenta propia, con la misma validación en vivo que el registro. */
export function ProfileNameForm({ fullName }: { fullName: string }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(updateMyName, {});
  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state.notice && <FormAlert tone="success">{state.notice}</FormAlert>}
      <FullNameField defaultValue={state.values?.full_name ?? fullName} error={state.fieldErrors?.full_name} />
      <Button type="submit" pending={pending} pendingLabel={t.common.saving}>
        {t.common.save}
      </Button>
    </form>
  );
}
