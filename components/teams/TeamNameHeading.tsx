"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/instrument/Button";
import { Glyph } from "@/components/instrument/Glyph";
import { FormAlert } from "@/components/ui/FormAlert";
import type { TeamField } from "@/lib/actions/teams";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import { TEAM_NAME_MAX_LENGTH } from "@/lib/validation";

type RenameAction = (previous: FormState<TeamField>, formData: FormData) => Promise<FormState<TeamField>>;

const heading = "font-display text-hero font-bold tracking-tight text-ink [overflow-wrap:anywhere]";
const iconButton = "kin-btn kin-btn-quiet grid size-11 flex-none place-items-center rounded-full text-accent hover:bg-accent-soft";

/**
 * Nombre del equipo editable en su lugar: el lápiz lo vuelve un campo con la misma tipografía,
 * Enter guarda y Escape cancela. Sin JavaScript el nombre se ve igual, sólo que no se edita aquí.
 */
export function TeamNameHeading({ name, action }: { name: string; action: RenameAction }) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const pencil = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  const [state, formAction, pending] = useActionState<FormState<TeamField>, FormData>(async (previous, formData) => {
    const next = await action(previous, formData);
    if (next.notice) setEditing(false);
    return next;
  }, {});

  // Al salir de la edición devuelvo el foco al lápiz: si no, quedaría en el body y el teclado se pierde
  useEffect(() => {
    if (!editing && wasEditing.current) pencil.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  if (!editing) {
    return (
      <div className="flex items-center justify-center gap-2">
        <h1 id="team-title" className={`${heading} text-center`}>{name}</h1>
        <button ref={pencil} type="button" className={iconButton} aria-label={t.teams.editName} onClick={() => setEditing(true)}>
          <Glyph name="edit" size={20} />
        </button>
      </div>
    );
  }

  const error = state.fieldErrors?.name ?? state.error;
  return (
    <div className="grid justify-items-center gap-2">
      <h1 id="team-title" className="visually-hidden">{name}</h1>
      <form action={formAction} className="flex w-full max-w-2xl items-center justify-center gap-2" noValidate>
        <input
          name="name"
          defaultValue={state.values?.name ?? name}
          maxLength={TEAM_NAME_MAX_LENGTH}
          required
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => event.key === "Escape" && setEditing(false)}
          aria-label={t.teams.name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "team-name-error" : "team-name-hint"}
          className={`${heading} min-w-0 flex-1 border-b-2 border-accent bg-transparent text-center outline-none`}
        />
        <Button type="submit" variant="quiet" glyph="check" pending={pending} className="size-11 flex-none rounded-full px-0 [&>span]:visually-hidden">{t.common.save}</Button>
        <button type="button" className={iconButton} aria-label={t.common.cancel} onClick={() => setEditing(false)}>
          <Glyph name="close" size={20} />
        </button>
      </form>
      {error ? (
        <div id="team-name-error"><FormAlert tone="error">{error}</FormAlert></div>
      ) : (
        <p id="team-name-hint" className="text-sm text-ink-muted">{t.teams.editNameHint}</p>
      )}
    </div>
  );
}
