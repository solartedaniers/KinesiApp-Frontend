// Contrato entre una Server Action y su formulario (useActionState).
export type FormState<Field extends string = string> = {
  /** Mensaje general, ya traducido. */
  error?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  /** Valores a reponer tras un error (React reinicia el formulario al terminar la acción). Nunca contraseñas. */
  values?: Partial<Record<Field, string>>;
  /** Correo sin verificar: el formulario ofrece ir a verificarlo. */
  unverifiedEmail?: string;
};

export const EMPTY_FORM_STATE: FormState = {};

export function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
