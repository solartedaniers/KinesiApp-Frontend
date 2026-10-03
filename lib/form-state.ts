// Contrato entre una Server Action y su formulario (useActionState).
export type FormState<Field extends string = string> = {
  /** Mensaje general, ya traducido. */
  error?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  /** Valores a reponer tras un error (React reinicia el formulario al terminar la acción). Nunca contraseñas. */
  values?: Partial<Record<Field, string>>;
  /** Correo sin verificar: el formulario ofrece ir a verificarlo. */
  unverifiedEmail?: string;
  /** El correo no tiene cuenta: el formulario de login ofrece registrarse. */
  emailNotRegistered?: boolean;
  /** Mensaje informativo o de éxito, ya traducido. */
  notice?: string;
  /** Cambia cada vez que se envía un código: reinicia la espera para reenviar. */
  codeSentId?: number;
};

// Valor del botón que envió el formulario (name="intent") cuando un formulario tiene varias acciones
export const FORM_INTENT = {
  resend: "resend",
  restart: "restart",
} as const;

export function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
