"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { FullNameField } from "@/components/ui/FullNameField";
import { NewPasswordField } from "@/components/ui/NewPasswordField";
import { PasswordField } from "@/components/ui/PasswordField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextField } from "@/components/ui/TextField";
import { register, type RegisterField } from "@/lib/actions/auth";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { ROUTES, withEmail } from "@/lib/routes";
import { SIGNUP_ROLES } from "@/lib/types";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

import styles from "./AuthForm.module.css";

const INITIAL_STATE: FormState<RegisterField> = {};

export function RegisterForm() {
  const t = useT();
  const roleOptions = SIGNUP_ROLES.map((role) => ({ value: role, label: t.roles[role] }));
  const [state, formAction, pending] = useActionState(register, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && (
        <FormAlert tone="error">
          <p>{state.error}</p>
          {state.unverifiedEmail && (
            <Link href={withEmail(ROUTES.verifyEmail, state.unverifiedEmail)}>{t.register.verifyNow}</Link>
          )}
        </FormAlert>
      )}

      <SegmentedControl
        name="role"
        legend={t.fields.role}
        options={roleOptions}
        defaultValue={state.values?.role ?? SIGNUP_ROLES[0]}
        error={state.fieldErrors?.role}
      />
      <FullNameField defaultValue={state.values?.full_name} error={state.fieldErrors?.full_name} />
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
      <NewPasswordField
        name="password"
        label={t.fields.password}
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
      <Button type="submit" block pending={pending} pendingLabel={t.register.pending} className={styles.submit}>
        {t.register.submit}
      </Button>
    </form>
  );
}
