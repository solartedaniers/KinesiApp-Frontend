"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { OtpField } from "@/components/ui/OtpField";
import { TextField } from "@/components/ui/TextField";
import { verifyEmail, type VerifyEmailField } from "@/lib/actions/email-verification";
import type { FormState } from "@/lib/form-state";
import { t } from "@/lib/i18n";
import { EMAIL_PARAM } from "@/lib/routes";

import styles from "./AuthForm.module.css";
import { ResendCodeButton } from "./ResendCodeButton";

const INITIAL_STATE: FormState<VerifyEmailField> = {};

/** Versión con el correo de `?email=`. La página la envuelve en Suspense (isla CSR, §3). */
export function VerifyEmailFromQuery() {
  return <VerifyEmailForm defaultEmail={useSearchParams().get(EMAIL_PARAM) ?? ""} />;
}

/** También es el fallback estático de la página: sin JS, el usuario escribe su correo. */
export function VerifyEmailForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction, pending] = useActionState(verifyEmail, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state.notice && <FormAlert tone="info">{state.notice}</FormAlert>}

      <TextField
        name="email"
        type="email"
        label={t.fields.email}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email ?? defaultEmail}
        error={state.fieldErrors?.email}
      />
      <OtpField error={state.fieldErrors?.code} autoFocus={Boolean(defaultEmail)} />
      <Button type="submit" block pending={pending} pendingLabel={t.verifyEmail.pending} className={styles.submit}>
        {t.verifyEmail.submit}
      </Button>
      <ResendCodeButton key={state.codeSentId ?? 0} coolingDown={Boolean(state.codeSentId)} pending={pending} />
    </form>
  );
}
