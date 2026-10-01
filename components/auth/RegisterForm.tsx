"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { PasswordField } from "@/components/ui/PasswordField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextField } from "@/components/ui/TextField";
import { register, type RegisterField } from "@/lib/actions/auth";
import type { FormState } from "@/lib/form-state";
import { t } from "@/lib/i18n";
import { ROUTES, withEmail } from "@/lib/routes";
import { SIGNUP_ROLES } from "@/lib/types";
import { FULL_NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/validation";

import styles from "./AuthForm.module.css";

const INITIAL_STATE: FormState<RegisterField> = {};
const ROLE_OPTIONS = SIGNUP_ROLES.map((role) => ({ value: role, label: t.roles[role] }));

export function RegisterForm() {
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
        options={ROLE_OPTIONS}
        defaultValue={state.values?.role ?? SIGNUP_ROLES[0]}
        error={state.fieldErrors?.role}
      />
      <TextField
        name="full_name"
        label={t.fields.fullName}
        autoComplete="name"
        maxLength={FULL_NAME_MAX_LENGTH}
        required
        defaultValue={state.values?.full_name}
        error={state.fieldErrors?.full_name}
      />
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
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        required
        hint={t.fields.passwordHint}
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
