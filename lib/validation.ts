// Mismas reglas que el backend (schemas/password_policy.py, schemas/user.py, schemas/auth.py):
// el cliente avisa antes, el backend sigue siendo quien decide.

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const FULL_NAME_MAX_LENGTH = 150;
export const OTP_LENGTH = 6;

export type ValidationError =
  | "required"
  | "invalidEmail"
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordWeak"
  | "passwordMismatch"
  | "fullNameTooLong"
  | "invalidOtp"
  | "invalidOption";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
  if (value.length < PASSWORD_MIN_LENGTH) return "passwordTooShort";
  if (value.length > PASSWORD_MAX_LENGTH) return "passwordTooLong";
  return /\p{L}/u.test(value) && /\d/.test(value) ? null : "passwordWeak";
}

export function validatePasswordConfirmation(password: string, confirmation: string): ValidationError | null {
  if (!confirmation) return "required";
  return password === confirmation ? null : "passwordMismatch";
}

export function validateFullName(value: string): ValidationError | null {
  if (!value.trim()) return "required";
  return value.trim().length <= FULL_NAME_MAX_LENGTH ? null : "fullNameTooLong";
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
