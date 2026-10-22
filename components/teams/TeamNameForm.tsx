"use client";

import { useActionState } from "react";

import { Button } from "@/components/instrument/Button";
import { TextField } from "@/components/instrument/Fields";
import { FormAlert } from "@/components/ui/FormAlert";
import type { TeamField } from "@/lib/actions/teams";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { TEAM_NAME_MAX_LENGTH } from "@/lib/validation";

type TeamNameAction = (previous: FormState<TeamField>, formData: FormData) => Promise<FormState<TeamField>>;

/** Alta de un equipo en una línea: al crearlo, la acción abre su página. */
export function TeamNameForm({ action }: { action: TeamNameAction }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="grid gap-3" noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <TextField
          name="name"
          label={t.teams.name}
          placeholder={t.teams.namePlaceholder}
          maxLength={TEAM_NAME_MAX_LENGTH}
          required
          defaultValue={state.values?.name}
          error={state.fieldErrors?.name}
        />
        <Button type="submit" glyph="plus" pending={pending}>{t.teams.create}</Button>
      </div>
    </form>
  );
}
