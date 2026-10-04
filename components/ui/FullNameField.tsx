"use client";

import { useState } from "react";

import { validationMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/client";
import { FULL_NAME_MAX_LENGTH, validateFullName, type ValidationError } from "@/lib/validation";

import { TextField } from "./TextField";

/**
 * Nombre de una persona con feedback inmediato (sólo letras y espacios), el mismo en el registro y
 * en los deportistas gestionados. "Obligatorio" no se avisa mientras se escribe, sólo al enviar.
 */
export function FullNameField({ defaultValue, error, autoComplete = "name" }: { defaultValue?: string; error?: string; autoComplete?: string }) {
  const t = useT();
  const [liveError, setLiveError] = useState<ValidationError | null>(null);

  return (
    <TextField
      name="full_name"
      label={t.fields.fullName}
      autoComplete={autoComplete}
      maxLength={FULL_NAME_MAX_LENGTH}
      required
      defaultValue={defaultValue}
      onChange={(event) => {
        const validation = validateFullName(event.target.value);
        setLiveError(validation === "required" ? null : validation);
      }}
      error={liveError ? validationMessage(t, liveError) : error}
    />
  );
}
