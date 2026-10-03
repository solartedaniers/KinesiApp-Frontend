"use client";

import { useState } from "react";

import { format, t } from "@/lib/i18n";
import { PASSWORD_MIN_LENGTH, type PasswordRequirement, passwordRequirementStatus } from "@/lib/validation";

import { Icon } from "./Icon";
import { PasswordField } from "./PasswordField";
import type { TextFieldProps } from "./TextField";
import styles from "./NewPasswordField.module.css";

/** Contraseña nueva con la lista de requisitos marcándose mientras se escribe (feedback inmediato). */
export function NewPasswordField(props: Omit<TextFieldProps, "type" | "action" | "hint" | "onChange">) {
  const [value, setValue] = useState("");
  const status = passwordRequirementStatus(value);
  const listId = `field-${props.name}-requirements`;

  return (
    <div className={styles.wrapper}>
      <PasswordField {...props} aria-describedby={listId} onChange={(event) => setValue(event.target.value)} />
      <div id={listId}>
        <p className={styles.title}>{t.fields.passwordRequirementsTitle}</p>
        <ul className={styles.list}>
          {(Object.keys(status) as PasswordRequirement[]).map((requirement) => (
            <li key={requirement} className={status[requirement] ? styles.met : styles.missing}>
              {status[requirement] && <Icon name="check" size={14} />}
              {format(t.fields.passwordRequirements[requirement], { min: PASSWORD_MIN_LENGTH })}
              <span className="visually-hidden">
                {` (${status[requirement] ? t.fields.passwordRequirementMet : t.fields.passwordRequirementMissing})`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
