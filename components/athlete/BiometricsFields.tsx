"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextField } from "@/components/ui/TextField";
import type { BiometricsField } from "@/lib/biometrics";
import { useT } from "@/lib/i18n/client";
import { GENDERS } from "@/lib/types";
import { birthDateBounds } from "@/lib/validation";

/**
 * Campos de la ficha biométrica (sin <form>): los reusan el alta obligatoria, la edición del perfil y
 * los deportistas gestionados del coach. No hay campo de edad: siempre se calcula de la fecha.
 */
export function BiometricsFields({
  values,
  errors,
  today,
}: {
  values?: Partial<Record<BiometricsField, string>>;
  errors?: Partial<Record<BiometricsField, string>>;
  /** "Hoy" del servidor (APP_TIME_ZONE), en ISO: el rango de fechas no depende del reloj del navegador. */
  today: string;
}) {
  const t = useT();
  const genderOptions = GENDERS.map((gender) => ({ value: gender, label: t.athleteProfile.gender[gender] }));
  const bounds = birthDateBounds(new Date(`${today}T00:00:00`));
  return (
    <>
      <SegmentedControl
        name="gender"
        legend={t.athleteProfile.genderLabel}
        options={genderOptions}
        defaultValue={values?.gender ?? ""}
        error={errors?.gender}
      />
      <TextField
        name="birth_date"
        type="date"
        label={t.biometrics.birthDate}
        min={bounds.min}
        max={bounds.max}
        required
        defaultValue={values?.birth_date}
        error={errors?.birth_date}
        hint={t.biometrics.birthDateHint}
      />
      <TextField
        name="height_cm"
        label={t.biometrics.heightCm}
        inputMode="decimal"
        autoComplete="off"
        required
        defaultValue={values?.height_cm}
        error={errors?.height_cm}
      />
      <TextField
        name="weight_kg"
        label={t.biometrics.weightKg}
        inputMode="decimal"
        autoComplete="off"
        required
        defaultValue={values?.weight_kg}
        error={errors?.weight_kg}
      />
    </>
  );
}
