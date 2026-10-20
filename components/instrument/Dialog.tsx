"use client";

import { useId, useRef } from "react";

import { Button } from "./Button";

import { cssVars } from "@/lib/design/css";

type Labels = { open: string; title: string; body: string; confirm: string; cancel: string };

/**
 * Confirmación con <dialog> nativo: showModal() ya atrapa el foco, cierra con Escape y devuelve el
 * foco al botón que lo abrió, así que no reimplemento nada de eso.
 */
export function ConfirmDialog({ labels }: { labels: Labels }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <>
      <Button variant="secondary" glyph="trash" onClick={() => ref.current?.showModal()}>{labels.open}</Button>
      <dialog
        ref={ref}
        className="kin-dialog kin-card m-auto w-[min(26rem,calc(100vw-2rem))] p-0 text-ink"
        style={cssVars({ "--tint": "var(--kin-risk-high)" })}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-body`}
        onClick={(event) => event.target === ref.current && ref.current.close()}
      >
        <form method="dialog" className="grid gap-4 p-6">
          <h4 id={`${id}-title`} className="font-display text-xl font-semibold">{labels.title}</h4>
          <p id={`${id}-body`} className="text-sm text-ink-muted">{labels.body}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="submit" variant="quiet" value="cancel" autoFocus>{labels.cancel}</Button>
            <Button type="submit" value="confirm" className="[--kin-accent:var(--kin-risk-high)] [--kin-accent-hover:var(--kin-risk-high)]">{labels.confirm}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
