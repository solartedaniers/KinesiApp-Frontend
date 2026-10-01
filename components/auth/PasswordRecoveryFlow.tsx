"use client";

import { useActionState } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { OtpField } from "@/components/ui/OtpField";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { recoverPassword, type RecoveryState, type RecoveryStep } from "@/lib/actions/password-recovery";
import { FORM_INTENT } from "@/lib/form-state";
import { format, t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

import styles from "./AuthForm.module.css";
import { ResendCodeButton } from "./ResendCodeButton";
import { StepIndicator } from "./StepIndicator";

const INITIAL_STATE: RecoveryState = { step: "email" };
const STEP_ORDER: RecoveryStep[] = ["email", "code", "password"];

/** Recuperación en 3 pasos dentro de una sola ruta: correo → código → contraseña nueva. */
export function PasswordRecoveryFlow() {
  const [state, formAction, pending] = useActionState(recoverPassword, INITIAL_STATE);

  if (state.step === "done") {
    return (
      <div className={styles.form}>
        <FormAlert tone="success">
          <strong>{t.recovery.doneTitle}</strong>
          <p>{t.recovery.done}</p>
        </FormAlert>
        <ButtonLink href={ROUTES.login} block>
          {t.recovery.goToLogin}
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <StepIndicator
        current={STEP_ORDER.indexOf(state.step) + 1}
        total={STEP_ORDER.length}
        label={t.recovery.steps[state.step]}
      />
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state.notice && <FormAlert tone="info">{state.notice}</FormAlert>}

      {state.step === "email" && (
        <>
          <p className={styles.hint}>{t.recovery.emailHint}</p>
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
          <Button type="submit" block pending={pending} pendingLabel={t.recovery.pending} className={styles.submit}>
            {t.recovery.sendCode}
          </Button>
        </>
      )}

      {state.step === "code" && (
        <>
          <p className={styles.hint}>{format(t.recovery.codeHint, { email: state.email ?? "" })}</p>
          <OtpField error={state.fieldErrors?.code} autoFocus />
          <Button type="submit" block pending={pending} pendingLabel={t.recovery.pending} className={styles.submit}>
            {t.recovery.verifyCode}
          </Button>
          <ResendCodeButton key={state.codeSentId ?? 0} coolingDown pending={pending} />
          <RestartButton disabled={pending} />
        </>
      )}

      {state.step === "password" && (
        <>
          <p className={styles.hint}>{t.recovery.passwordHint}</p>
          {/* Para que el gestor de contraseñas asocie la nueva clave a la cuenta correcta */}
          <input type="hidden" name="username" autoComplete="username" value={state.email ?? ""} readOnly />
          <PasswordField
            name="password"
            label={t.fields.newPassword}
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            required
            autoFocus
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
          <Button type="submit" block pending={pending} pendingLabel={t.recovery.pending} className={styles.submit}>
            {t.recovery.savePassword}
          </Button>
        </>
      )}
    </form>
  );
}

function RestartButton({ disabled }: { disabled: boolean }) {
  return (
    <Button type="submit" name="intent" value={FORM_INTENT.restart} variant="ghost" block disabled={disabled} formNoValidate>
      {t.recovery.changeEmail}
    </Button>
  );
}
