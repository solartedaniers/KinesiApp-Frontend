"use client";

import { useT } from "@/lib/i18n/client";
import { OTP_LENGTH } from "@/lib/validation";

import { fieldStyles as styles } from "./field-classes";
import { TextField } from "./TextField";

/** Código de un solo uso: teclado numérico y autocompletado desde el SMS/correo del sistema. */
export function OtpField({ error, autoFocus }: { error?: string; autoFocus?: boolean }) {
  const t = useT();
  return (
    <TextField
      name="code"
      label={t.otp.label}
      hint={t.otp.hint}
      error={error}
      className={styles.otp}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern={`\\d{${OTP_LENGTH}}`}
      maxLength={OTP_LENGTH}
      required
      autoFocus={autoFocus}
    />
  );
}
