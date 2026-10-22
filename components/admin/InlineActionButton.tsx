"use client";

import { useActionState } from "react";

import { Button } from "@/components/instrument/Button";
import type { InlineResult } from "@/lib/actions/admin";
import type { GlyphName } from "@/lib/design/icons";

/** Un botón con su Server Action ligada dentro de una fila, con el error debajo. */
export function InlineActionButton({ label, glyph, action }: { label: string; glyph?: GlyphName; action: () => Promise<InlineResult> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <Button type="submit" variant="quiet" glyph={glyph} pending={pending}>{label}</Button>
      {state.error && <p className="basis-full text-xs font-medium text-ink" role="alert">{state.error}</p>}
    </form>
  );
}
