"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { apiRequest } from "../api";
import { API_PATHS } from "../api-paths";
import { ApiError, errorMessage, validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { getT } from "../i18n/server";
import { NEXT_PARAM, ROUTES, safeNextPath, withEmail } from "../routes";
import { storeSession } from "../session";
import { SIGNUP_ROLES, type TokenPair } from "../types";
import {
  collectErrors,
  normalizeFullName,
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
  const t = await getT();
  const email = formText(formData, "email").trim();
  const password = formText(formData, "password");
  const values = { email };

  const errors = collectErrors({ email: validateEmail(email), password: validateRequired(password) });
  if (errors) return { fieldErrors: validationMessages(t, errors), values };

  let tokens: TokenPair;
  try {
    tokens = await apiRequest<TokenPair>(API_PATHS.login, { method: "POST", body: { email, password } });
  } catch (error) {
    const code = error instanceof ApiError ? error.code : undefined;
    return {
      error: errorMessage(t, error),
      values,
      unverifiedEmail: code === "email_not_verified" ? email : undefined,
      emailNotRegistered: code === "email_not_registered",
    };
  }

  await storeSession(tokens);
  redirect((await nextFromReferer()) ?? ROUTES.home);
}

// `?next=` se lee del Referer (la propia página de login) y no de un campo del formulario:
// así el formulario de /login no depende del cliente y funciona sin JavaScript
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
  const t = await getT();
  const fullName = normalizeFullName(formText(formData, "full_name"));
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
  if (errors) return { fieldErrors: validationMessages(t, errors), values };

  try {
    await apiRequest(API_PATHS.register, { method: "POST", body: { full_name: fullName, email, password, role } });
  } catch (error) {
    // Dominio sin correo: el error va junto al campo, para que se corrija ahí
    if (error instanceof ApiError && error.code === "email_domain_undeliverable") {
      return { fieldErrors: { email: errorMessage(t, error) }, values };
    }
    // La cuenta sí quedó creada aunque el correo no salió: se puede pedir otro código al verificar
    const accountCreated = error instanceof ApiError && error.code === "email_delivery_failed";
    return { error: errorMessage(t, error), values, unverifiedEmail: accountCreated ? email : undefined };
  }

  redirect(withEmail(ROUTES.verifyEmail, email));
}
