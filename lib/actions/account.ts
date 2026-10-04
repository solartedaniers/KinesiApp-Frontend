"use server";

import { apiRequest } from "../api";
import { API_PATHS } from "../api-paths";
import { errorMessage, validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { getT } from "../i18n/server";
import { readAccessToken, storeSession } from "../session";
import type { TokenPair } from "../types";
import { collectErrors, validateNewPassword, validatePasswordConfirmation, validateRequired } from "../validation";

export type ChangePasswordField = "current_password" | "password" | "confirm_password";

export async function changePassword(
  _previous: FormState<ChangePasswordField>,
  formData: FormData,
): Promise<FormState<ChangePasswordField>> {
  const t = await getT();
  const currentPassword = formText(formData, "current_password");
  const password = formText(formData, "password");

  const errors = collectErrors({
    current_password: validateRequired(currentPassword),
    password: validateNewPassword(password),
    confirm_password: validatePasswordConfirmation(password, formText(formData, "confirm_password")),
  });
  if (errors) return { fieldErrors: validationMessages(t, errors) };

  let tokens: TokenPair;
  try {
    tokens = await apiRequest<TokenPair>(API_PATHS.changePassword, {
      method: "POST",
      body: { current_password: currentPassword, new_password: password },
      accessToken: (await readAccessToken()) ?? undefined,
    });
  } catch (error) {
    return { error: errorMessage(t, error) };
  }

  // El backend revoca todos los refresh tokens y emite un par nuevo para este dispositivo
  await storeSession(tokens);
  return { notice: t.changePassword.success };
}
