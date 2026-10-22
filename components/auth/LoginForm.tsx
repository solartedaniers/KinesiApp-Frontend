"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { login, type LoginField } from "@/lib/actions/auth";
import type { DemoLogin } from "@/lib/demo-login";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { ROUTES, withEmail } from "@/lib/routes";

import { formStyles as styles } from "@/components/app/page-classes";

const INITIAL_STATE: FormState<LoginField> = {};

/**
 * Cliente sólo por el estado de error/carga: sin JS, el <form> igual envía la Server Action.
 * `demo` llega solo cuando la página tiene la cuenta de demostración configurada; se puede borrar y escribir otra.
 */
export function LoginForm({ demo }: { demo?: DemoLogin | null }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {demo && <FormAlert tone="info">{t.login.demoNotice}</FormAlert>}
      {state.error && (
        <FormAlert tone="error">
          <p>{state.error}</p>
          {state.unverifiedEmail && (
            <Link href={withEmail(ROUTES.verifyEmail, state.unverifiedEmail)}>{t.login.verifyNow}</Link>
          )}
          {state.emailNotRegistered && <Link href={ROUTES.register}>{t.login.registerNow}</Link>}
        </FormAlert>
      )}

      <TextField
        name="email"
        type="email"
        label={t.fields.email}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email ?? demo?.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField
        name="password"
        label={t.fields.password}
        autoComplete="current-password"
        required
        defaultValue={demo?.password}
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
