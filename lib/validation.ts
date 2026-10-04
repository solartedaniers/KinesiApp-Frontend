import { ageOn } from "./analysis-stats.ts";

// Mismas reglas que el backend (schemas/password_policy.py, schemas/person_name.py, schemas/auth.py):
// el cliente avisa antes, el backend sigue siendo quien decide.

// Iguales a PASSWORD_MIN_LENGTH / PASSWORD_MAX_LENGTH de backend/app/core/config.py
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const FULL_NAME_MAX_LENGTH = 150;
export const OTP_LENGTH = 6;
// Iguales a ATHLETE_MIN_AGE_YEARS / ATHLETE_MAX_AGE_YEARS del backend y a los límites de AthleteProfileBase
export const ATHLETE_MIN_AGE_YEARS = 5;
export const ATHLETE_MAX_AGE_YEARS = 100;
export const HEIGHT_MAX_CM = 300;
// Igual al largo de teams.name en el backend
export const TEAM_NAME_MAX_LENGTH = 100;
// Igual a CHAT_MESSAGE_MAX_CHARS del backend
export const CHAT_MESSAGE_MAX_LENGTH = 1000;
export const WEIGHT_MAX_KG = 400;

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
  | "invalidOption"
  | "consentRequired"
  | "chatMessageTooLong"
  | "teamNameTooLong"
  | "invalidDate"
  | "birthDateInFuture"
  | "ageOutOfRange"
  | "invalidNumber"
  | "heightOutOfRange"
  | "weightOutOfRange";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
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

/** Fecha ISO (yyyy-mm-dd) de nacimiento: pasada y con una edad dentro del rango admitido. */
export function validateBirthDate(value: string, today: Date): ValidationError | null {
  if (!value) return "required";
  if (!isRealIsoDate(value)) return "invalidDate";
  if (value >= isoDate(today)) return "birthDateInFuture";
  const age = ageOn(value, today);
  return age >= ATHLETE_MIN_AGE_YEARS && age <= ATHLETE_MAX_AGE_YEARS ? null : "ageOutOfRange";
}

function validateMeasure(value: string, max: number, outOfRange: ValidationError): ValidationError | null {
  if (!value.trim()) return "required";
  const number = Number(value.replace(",", "."));
  if (!Number.isFinite(number)) return "invalidNumber";
  return number > 0 && number <= max ? null : outOfRange;
}

export const validateHeight = (value: string) => validateMeasure(value, HEIGHT_MAX_CM, "heightOutOfRange");
export const validateWeight = (value: string) => validateMeasure(value, WEIGHT_MAX_KG, "weightOutOfRange");

/** "72,5" o "72.5" → 72.5: el teclado numérico en español escribe coma decimal. */
export function parseMeasure(value: string): number {
  return Number(value.replace(",", "."));
}

/** "2000-02-30" tiene el formato pero no existe: Date.parse lo acepta, así que se reconstruye la fecha. */
function isRealIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** Date local → "yyyy-mm-dd", sin pasar por UTC (toISOString correría el día). */
export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Límites del <input type="date"> de nacimiento, mismo rango que validateBirthDate. */
export function birthDateBounds(today: Date): { min: string; max: string } {
  const shift = (years: number, days = 0) => new Date(today.getFullYear() - years, today.getMonth(), today.getDate() + days);
  // min: el día siguiente a cumplir MAX + 1 años, el primero en que la edad todavía es MAX
  return { min: isoDate(shift(ATHLETE_MAX_AGE_YEARS + 1, 1)), max: isoDate(shift(ATHLETE_MIN_AGE_YEARS)) };
}

export function validateOption<T extends string>(value: string, options: readonly T[]): ValidationError | null {
  return (options as readonly string[]).includes(value) ? null : "invalidOption";
}

/** Valores que interpola el mensaje de cada error ({min}, {max}): salen de las mismas constantes. */
export const VALIDATION_PARAMS: Partial<Record<ValidationError, Record<string, number>>> = {
  passwordTooShort: { min: PASSWORD_MIN_LENGTH },
  passwordTooLong: { max: PASSWORD_MAX_LENGTH },
  fullNameTooLong: { max: FULL_NAME_MAX_LENGTH },
  ageOutOfRange: { min: ATHLETE_MIN_AGE_YEARS, max: ATHLETE_MAX_AGE_YEARS },
  heightOutOfRange: { max: HEIGHT_MAX_CM },
  weightOutOfRange: { max: WEIGHT_MAX_KG },
  chatMessageTooLong: { max: CHAT_MESSAGE_MAX_LENGTH },
  teamNameTooLong: { max: TEAM_NAME_MAX_LENGTH },
};

export function validateTeamName(value: string): ValidationError | null {
  if (!value.trim()) return "required";
  return value.trim().length <= TEAM_NAME_MAX_LENGTH ? null : "teamNameTooLong";
}

export function validateChatMessage(value: string): ValidationError | null {
  if (!value.trim()) return "required";
  return value.trim().length <= CHAT_MESSAGE_MAX_LENGTH ? null : "chatMessageTooLong";
}

/** null si todos los campos son válidos; si no, sólo los campos con error. */
export function collectErrors<K extends string>(
  checks: Record<K, ValidationError | null>,
): Partial<Record<K, ValidationError>> | null {
  const entries = Object.entries(checks).filter(([, error]) => error !== null);
  return entries.length ? (Object.fromEntries(entries) as Partial<Record<K, ValidationError>>) : null;
}
