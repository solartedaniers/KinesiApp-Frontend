"use server";

import { validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { authGateway } from "../grpc/auth-gateway";
import { getT } from "../i18n/server";
import { storeSession } from "../session";
import type { TokenPair } from "../types";
import { collectErrors, validateNewPassword, validatePasswordConfirmation, validateRequired } from "../validation";
import { authedMutation, failureMessage } from "./request";

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
    tokens = await authedMutation(() => authGateway().changePassword(currentPassword, password));
  } catch (error) {
    return { error: failureMessage(t, error) };
  }

  // El backend revoca las demás sesiones y abre una nueva en este dispositivo
  await storeSession(tokens);
  return { notice: t.changePassword.success };
}
