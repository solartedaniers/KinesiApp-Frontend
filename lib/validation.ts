// Mismas reglas que el backend (schemas/password_policy.py, schemas/person_name.py, schemas/auth.py):
// el cliente avisa antes, el backend sigue siendo quien decide.

// Iguales a PASSWORD_MIN_LENGTH / PASSWORD_MAX_LENGTH de backend/app/core/config.py
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const FULL_NAME_MAX_LENGTH = 150;
export const OTP_LENGTH = 6;

export type ValidationError =
  | "required"
  | "invalidEmail"
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordNoUppercase"
  | "passwordNoLowercase"
  | "passwordNoDigit"
  | "passwordNoSpecial"
  | "passwordMismatch"
  | "fullNameTooLong"
  | "fullNameInvalid"
  | "invalidOtp"
  | "invalidOption";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Sólo letras de cualquier alfabeto (tildes, ñ, diéresis) y un espacio entre palabras
const FULL_NAME_PATTERN = /^\p{L}+(?: \p{L}+)*$/u;

export type PasswordRequirement = "minLength" | "uppercase" | "lowercase" | "digit" | "special";

// En el mismo orden que el backend. El espacio no cuenta como carácter especial
const PASSWORD_REQUIREMENTS: Record<PasswordRequirement, (value: string) => boolean> = {
  minLength: (value) => value.length >= PASSWORD_MIN_LENGTH,
  uppercase: (value) => /\p{Lu}/u.test(value),
  lowercase: (value) => /\p{Ll}/u.test(value),
  digit: (value) => /\p{Nd}/u.test(value),
  special: (value) => /[^\p{L}\p{N}\s]/u.test(value),
};

const REQUIREMENT_ERRORS: Record<PasswordRequirement, ValidationError> = {
  minLength: "passwordTooShort",
  uppercase: "passwordNoUppercase",
  lowercase: "passwordNoLowercase",
  digit: "passwordNoDigit",
  special: "passwordNoSpecial",
};

/** Requisitos de la contraseña nueva y si el valor actual los cumple, para la lista en vivo. */
export function passwordRequirementStatus(value: string): Record<PasswordRequirement, boolean> {
  return Object.fromEntries(
    Object.entries(PASSWORD_REQUIREMENTS).map(([requirement, isMet]) => [requirement, isMet(value)]),
  ) as Record<PasswordRequirement, boolean>;
}

/** Mismo criterio que el backend: NFC y espacios sobrantes colapsados. */
export function normalizeFullName(value: string): string {
  return value.normalize("NFC").trim().split(/\s+/).join(" ");
}
const OTP_PATTERN = new RegExp(`^\\d{${OTP_LENGTH}}$`);

export function validateRequired(value: string): ValidationError | null {
  return value.trim() ? null : "required";
}

export function validateEmail(value: string): ValidationError | null {
  if (!value.trim()) return "required";
  return EMAIL_PATTERN.test(value.trim()) ? null : "invalidEmail";
}

export function validateNewPassword(value: string): ValidationError | null {
  if (!value) return "required";
  if (value.length > PASSWORD_MAX_LENGTH) return "passwordTooLong";
  const status = passwordRequirementStatus(value);
  const missing = (Object.keys(status) as PasswordRequirement[]).find((requirement) => !status[requirement]);
  return missing ? REQUIREMENT_ERRORS[missing] : null;
}

export function validatePasswordConfirmation(password: string, confirmation: string): ValidationError | null {
  if (!confirmation) return "required";
  return password === confirmation ? null : "passwordMismatch";
}

export function validateFullName(value: string): ValidationError | null {
  const name = normalizeFullName(value);
  if (!name) return "required";
  if (name.length > FULL_NAME_MAX_LENGTH) return "fullNameTooLong";
  return FULL_NAME_PATTERN.test(name) ? null : "fullNameInvalid";
}

export function validateOtp(value: string): ValidationError | null {
  if (!value) return "required";
  return OTP_PATTERN.test(value) ? null : "invalidOtp";
}

export function validateOption<T extends string>(value: string, options: readonly T[]): ValidationError | null {
  return (options as readonly string[]).includes(value) ? null : "invalidOption";
}

/** null si todos los campos son válidos; si no, sólo los campos con error. */
export function collectErrors<K extends string>(
  checks: Record<K, ValidationError | null>,
): Partial<Record<K, ValidationError>> | null {
  const entries = Object.entries(checks).filter(([, error]) => error !== null);
  return entries.length ? (Object.fromEntries(entries) as Partial<Record<K, ValidationError>>) : null;
}
