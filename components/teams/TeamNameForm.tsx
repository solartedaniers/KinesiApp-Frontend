"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextField } from "@/components/ui/TextField";
import type { TeamField } from "@/lib/actions/teams";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { TEAM_NAME_MAX_LENGTH } from "@/lib/validation";

import styles from "./Teams.module.css";

type TeamNameAction = (previous: FormState<TeamField>, formData: FormData) => Promise<FormState<TeamField>>;

/** Nombre del equipo en una línea: lo usan el alta y el cambio de nombre. */
export function TeamNameForm({
  action,
  defaultName,
  submitLabel,
}: {
  action: TeamNameAction;
  defaultName?: string;
  submitLabel: string;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={styles.nameForm} noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state.notice && <FormAlert tone="success">{state.notice}</FormAlert>}
      <div className={styles.nameRow}>
        <TextField
          name="name"
          label={t.teams.name}
          maxLength={TEAM_NAME_MAX_LENGTH}
          required
          defaultValue={state.values?.name ?? defaultName}
          error={state.fieldErrors?.name}
        />
        <Button type="submit" pending={pending} pendingLabel={t.common.saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
