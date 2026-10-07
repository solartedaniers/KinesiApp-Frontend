"use client";

import { useState } from "react";

import { useT } from "@/lib/i18n/client";
import { PASSWORD_MAX_LENGTH } from "@/lib/validation";

import { Icon } from "./Icon";
import { fieldStyles as styles } from "./field-classes";
import { TextField, type TextFieldProps } from "./TextField";

/** Campo de contraseña con botón para mostrarla: la única razón de ser componente de cliente. */
export function PasswordField(props: Omit<TextFieldProps, "type" | "action">) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible ? t.fields.hidePassword : t.fields.showPassword;

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      maxLength={PASSWORD_MAX_LENGTH}
      action={
        <button
          type="button"
          className={styles.action}
          onClick={() => setVisible((current) => !current)}
          aria-label={toggleLabel}
          aria-pressed={visible}
          title={toggleLabel}
        >
          <Icon name={visible ? "eyeOff" : "eye"} />
        </button>
      }
    />
  );
}
