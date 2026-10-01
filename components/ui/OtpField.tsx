import { t } from "@/lib/i18n";
import { OTP_LENGTH } from "@/lib/validation";

import styles from "./Field.module.css";
import { TextField } from "./TextField";

/** Código de un solo uso: teclado numérico y autocompletado desde el SMS/correo del sistema. */
export function OtpField({ error, autoFocus }: { error?: string; autoFocus?: boolean }) {
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
