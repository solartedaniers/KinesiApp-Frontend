"use client";

import { useState } from "react";

import { format } from "@/lib/i18n";
import { useT } from "@/lib/i18n/client";
import { PASSWORD_MIN_LENGTH, type PasswordRequirement, passwordRequirementStatus } from "@/lib/validation";

import { Icon } from "./Icon";
import { PasswordField } from "./PasswordField";
import type { TextFieldProps } from "./TextField";

/** Contraseña nueva con la lista de requisitos marcándose mientras se escribe (feedback inmediato). */
export function NewPasswordField(props: Omit<TextFieldProps, "type" | "action" | "hint" | "onChange">) {
  const t = useT();
  const [value, setValue] = useState("");
  const status = passwordRequirementStatus(value);
  const listId = `field-${props.name}-requirements`;

  return (
    <div className="grid gap-2">
      <PasswordField {...props} aria-describedby={listId} onChange={(event) => setValue(event.target.value)} />
      <div id={listId}>
        <p className="text-xs text-ink-muted">{t.fields.passwordRequirementsTitle}</p>
        <ul className="mt-1 grid gap-1 text-xs">
          {(Object.keys(status) as PasswordRequirement[]).map((requirement) => (
            <li
              key={requirement}
              className={`flex items-center gap-1 ${status[requirement] ? "font-medium text-accent" : "text-ink-muted before:w-3.5 before:content-['']"}`}
            >
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
