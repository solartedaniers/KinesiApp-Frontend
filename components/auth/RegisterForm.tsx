"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
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

import { formStyles as styles } from "@/components/app/page-classes";

const INITIAL_STATE: FormState<RegisterField> = {};

export function RegisterForm() {
  const t = useT();
  const roleOptions = SIGNUP_ROLES.map((role) => ({ value: role, label: t.roles[role] }));
  const [state, formAction, pending] = useActionState(register, INITIAL_STATE);

  return (
    <form action={formAction} className={`${styles.form} lg:grid-cols-2 lg:gap-x-6 lg:*:col-span-2`} noValidate>
      {state.error && (
        <FormAlert tone="error">
          <p>{state.error}</p>
          {state.unverifiedEmail && (
            <Link href={withEmail(ROUTES.verifyEmail, state.unverifiedEmail)}>{t.register.verifyNow}</Link>
          )}
        </FormAlert>
      )}

      {/* En escritorio, quién es a la izquierda y la contraseña a la derecha */}
      <div className="grid content-start gap-4 lg:col-span-1!">
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
      </div>
      <div className="grid content-start gap-4 lg:col-span-1!">
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
      </div>
      {/* Obligatorio: Register exige la versión vigente del consentimiento de video */}
      <CheckboxField name="video_consent" required error={state.fieldErrors?.video_consent}>
        {t.register.videoConsent}{" "}
        <Link href={ROUTES.legalVideoConsent} target="_blank">
          {t.register.videoConsentLink}
        </Link>
      </CheckboxField>
      <Button type="submit" block pending={pending} pendingLabel={t.register.pending} className={styles.submit}>
        {t.register.submit}
      </Button>
    </form>
  );
}
