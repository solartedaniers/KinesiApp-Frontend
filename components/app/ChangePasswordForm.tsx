"use client";

import { useActionState } from "react";

import styles from "@/components/auth/AuthForm.module.css";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { NewPasswordField } from "@/components/ui/NewPasswordField";
import { PasswordField } from "@/components/ui/PasswordField";
import { changePassword, type ChangePasswordField } from "@/lib/actions/account";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

const INITIAL_STATE: FormState<ChangePasswordField> = {};

export function ChangePasswordForm({ email }: { email: string }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(changePassword, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state.notice && <FormAlert tone="success">{state.notice}</FormAlert>}

      {/* Para que el gestor de contraseñas asocie el cambio a la cuenta correcta */}
      <input type="hidden" name="username" autoComplete="username" value={email} readOnly />
      <PasswordField
        name="current_password"
        label={t.changePassword.currentPassword}
        autoComplete="current-password"
        required
        error={state.fieldErrors?.current_password}
      />
      <NewPasswordField
        name="password"
        label={t.fields.newPassword}
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        required
        error={state.fieldErrors?.password}
      />
      <PasswordField
        name="confirm_password"
        label={t.fields.confirmPassword}
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm_password}
      />
      <Button type="submit" block pending={pending} pendingLabel={t.changePassword.pending} className={styles.submit}>
        {t.changePassword.submit}
      </Button>
    </form>
  );
}
