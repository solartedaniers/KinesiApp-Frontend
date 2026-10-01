"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { apiRequest } from "../api";
import { API_PATHS } from "../api-paths";
import { ApiError, errorMessage, validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { NEXT_PARAM, ROUTES, safeNextPath, withEmail } from "../routes";
import { clearSession, readRefreshToken, storeSession } from "../session";
import { SIGNUP_ROLES, type TokenPair } from "../types";
import {
  collectErrors,
  validateEmail,
  validateFullName,
  validateNewPassword,
  validateOption,
  validatePasswordConfirmation,
  validateRequired,
} from "../validation";

export type LoginField = "email" | "password";
export type RegisterField = "full_name" | "email" | "password" | "confirm_password" | "role";

export async function login(_previous: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  const email = formText(formData, "email").trim();
  const password = formText(formData, "password");
  const values = { email };

  const errors = collectErrors({ email: validateEmail(email), password: validateRequired(password) });
  if (errors) return { fieldErrors: validationMessages(errors), values };

  let tokens: TokenPair;
  try {
    tokens = await apiRequest<TokenPair>(API_PATHS.login, { method: "POST", body: { email, password } });
  } catch (error) {
    const unverified = error instanceof ApiError && error.code === "email_not_verified";
    return { error: errorMessage(error), values, unverifiedEmail: unverified ? email : undefined };
  }

  await storeSession(tokens);
  redirect((await nextFromReferer()) ?? ROUTES.home);
}

export async function logout(): Promise<void> {
  const refreshToken = await readRefreshToken();
  if (refreshToken) {
    // Revoca el refresh token en el backend; si falla, la sesión local se cierra igual
    await apiRequest(API_PATHS.logout, { method: "POST", body: { refresh_token: refreshToken } }).catch(() => undefined);
  }
  await clearSession();
  redirect(ROUTES.login);
}

// `?next=` se lee del Referer (la propia página de login) y no de un campo del formulario:
// así /login sigue siendo SSG y su formulario funciona sin JavaScript
async function nextFromReferer(): Promise<string | null> {
  const referer = (await headers()).get("referer");
  if (!referer) return null;
  try {
    return safeNextPath(new URL(referer).searchParams.get(NEXT_PARAM));
  } catch {
    return null;
  }
}

export async function register(
  _previous: FormState<RegisterField>,
  formData: FormData,
): Promise<FormState<RegisterField>> {
  const fullName = formText(formData, "full_name").trim();
  const email = formText(formData, "email").trim();
  const password = formText(formData, "password");
  const role = formText(formData, "role");
  const values = { full_name: fullName, email, role };

  const errors = collectErrors({
    full_name: validateFullName(fullName),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirm_password: validatePasswordConfirmation(password, formText(formData, "confirm_password")),
    role: validateOption(role, SIGNUP_ROLES),
  });
  if (errors) return { fieldErrors: validationMessages(errors), values };

  try {
    await apiRequest(API_PATHS.register, { method: "POST", body: { full_name: fullName, email, password, role } });
  } catch (error) {
    // La cuenta sí quedó creada aunque el correo no salió: se puede pedir otro código al verificar
    const accountCreated = error instanceof ApiError && error.code === "email_delivery_failed";
    return { error: errorMessage(error), values, unverifiedEmail: accountCreated ? email : undefined };
  }

  redirect(withEmail(ROUTES.verifyEmail, email));
}
