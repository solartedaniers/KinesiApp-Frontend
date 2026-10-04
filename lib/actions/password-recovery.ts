"use server";

import { apiRequest } from "../api";
import { API_PATHS } from "../api-paths";
import { ApiError, errorMessage, validationMessages } from "../errors";
import { FORM_INTENT, formText, type FormState } from "../form-state";
import type { Dictionary } from "../i18n";
import { getT } from "../i18n/server";
import {
  collectErrors,
  validateEmail,
  validateNewPassword,
  validateOtp,
  validatePasswordConfirmation,
} from "../validation";

export type RecoveryStep = "email" | "code" | "password" | "done";
export type RecoveryField = "email" | "code" | "password" | "confirm_password";

/**
 * El paso, el correo y el código viven en el estado del formulario (memoria del cliente),
 * nunca en la URL ni en el historial (§3 del diseño). El backend revalida el código al confirmar.
 */
export type RecoveryState = FormState<RecoveryField> & { step: RecoveryStep; email?: string; code?: string };

export async function recoverPassword(previous: RecoveryState, formData: FormData): Promise<RecoveryState> {
  const t = await getT();
  const intent = formText(formData, "intent");
  if (intent === FORM_INTENT.restart) return { step: "email", values: { email: previous.email } };

  switch (previous.step) {
    case "email":
      return requestCode(t, formText(formData, "email").trim(), previous);
    case "code":
      return intent === FORM_INTENT.resend
        ? requestCode(t, previous.email ?? "", previous)
        : verifyCode(t, previous.email ?? "", formText(formData, "code").trim());
    case "password":
      return confirmNewPassword(
        t,
        previous,
        formText(formData, "password"),
        formText(formData, "confirm_password"),
      );
    default:
      return previous;
  }
}

async function requestCode(t: Dictionary, email: string, previous: RecoveryState): Promise<RecoveryState> {
  const errors = collectErrors({ email: validateEmail(email) });
  if (errors) return { step: "email", fieldErrors: validationMessages(t, errors), values: { email } };
  try {
    await apiRequest(API_PATHS.requestPasswordReset, { method: "POST", body: { email } });
  } catch (error) {
    return { ...previous, error: errorMessage(t, error), values: { email } };
  }
  return {
    step: "code",
    email,
    notice: previous.step === "code" ? t.recovery.codeSent : undefined,
    codeSentId: (previous.codeSentId ?? 0) + 1,
  };
}

async function verifyCode(t: Dictionary, email: string, code: string): Promise<RecoveryState> {
  const errors = collectErrors({ code: validateOtp(code) });
  if (errors) return { step: "code", email, fieldErrors: validationMessages(t, errors) };
  try {
    await apiRequest(API_PATHS.verifyPasswordResetCode, { method: "POST", body: { email, code } });
  } catch (error) {
    return { step: "code", email, error: errorMessage(t, error) };
  }
  return { step: "password", email, code };
}

async function confirmNewPassword(
  t: Dictionary,
  previous: RecoveryState,
  password: string,
  confirmation: string,
): Promise<RecoveryState> {
  const { email = "", code = "" } = previous;
  const errors = collectErrors({
    password: validateNewPassword(password),
    confirm_password: validatePasswordConfirmation(password, confirmation),
  });
  if (errors) return { step: "password", email, code, fieldErrors: validationMessages(t, errors) };

  try {
    await apiRequest(API_PATHS.confirmPasswordReset, {
      method: "POST",
      body: { email, code, new_password: password },
    });
  } catch (error) {
    // El código venció o se agotaron los intentos entre el paso 2 y el 3: hay que pedir otro
    const codeRejected = error instanceof ApiError && error.code === "invalid_otp";
    return codeRejected
      ? { step: "code", email, error: errorMessage(t, error) }
      : { step: "password", email, code, error: errorMessage(t, error) };
  }
  return { step: "done", email };
}
