"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { login, type LoginField } from "@/lib/actions/auth";
import type { FormState } from "@/lib/form-state";
import { t } from "@/lib/i18n";
import { ROUTES, withEmail } from "@/lib/routes";

import styles from "./AuthForm.module.css";

const INITIAL_STATE: FormState<LoginField> = {};

/** Cliente sólo por el estado de error/carga: sin JS, el <form> igual envía la Server Action. */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && (
        <FormAlert tone="error">
          <p>{state.error}</p>
          {state.unverifiedEmail && (
            <Link href={withEmail(ROUTES.verifyEmail, state.unverifiedEmail)}>{t.login.verifyNow}</Link>
          )}
        </FormAlert>
      )}

      <TextField
        name="email"
        type="email"
        label={t.fields.email}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField
        name="password"
        label={t.fields.password}
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <div className={styles.row}>
        <Link href={ROUTES.passwordRecovery}>{t.login.forgotPassword}</Link>
      </div>
      <Button type="submit" block pending={pending} pendingLabel={t.login.pending} className={styles.submit}>
        {t.login.submit}
      </Button>
    </form>
  );
}
