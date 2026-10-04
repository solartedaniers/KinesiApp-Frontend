"use server";

import { redirect } from "next/navigation";

import { apiRequest } from "../api";
import { API_PATHS } from "../api-paths";
import { errorMessage, validationMessages } from "../errors";
import { FORM_INTENT, formText, type FormState } from "../form-state";
import { getT } from "../i18n/server";
import { ROUTES } from "../routes";
import { storeSession } from "../session";
import type { TokenPair } from "../types";
import { collectErrors, validateEmail, validateOtp } from "../validation";

export type VerifyEmailField = "email" | "code";

/** Un solo formulario, dos botones: verificar el código o pedir uno nuevo (`intent`). */
export async function verifyEmail(
  previous: FormState<VerifyEmailField>,
  formData: FormData,
): Promise<FormState<VerifyEmailField>> {
  const t = await getT();
  const email = formText(formData, "email").trim();
  const values = { email };

  if (formText(formData, "intent") === FORM_INTENT.resend) {
    const errors = collectErrors({ email: validateEmail(email) });
    if (errors) return { fieldErrors: validationMessages(t, errors), values };
    try {
      await apiRequest(API_PATHS.requestVerificationCode, { method: "POST", body: { email } });
    } catch (error) {
      return { error: errorMessage(t, error), values };
    }
    return { notice: t.verifyEmail.codeSent, values, codeSentId: (previous.codeSentId ?? 0) + 1 };
  }

  const code = formText(formData, "code").trim();
  const errors = collectErrors({ email: validateEmail(email), code: validateOtp(code) });
  if (errors) return { fieldErrors: validationMessages(t, errors), values };

  let tokens: TokenPair;
  try {
    tokens = await apiRequest<TokenPair>(API_PATHS.verifyEmail, { method: "POST", body: { email, code } });
  } catch (error) {
    return { error: errorMessage(t, error), values };
  }

  // Verificar el correo ya inicia sesión: el backend devuelve el par de tokens
  await storeSession(tokens);
  redirect(ROUTES.home);
}
