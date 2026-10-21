"use client";

import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "./Button";

import { cssVars } from "@/lib/design/css";

type Labels = { open: string; title: string; body: string; confirm: string; cancel: string };

const DANGER = "[--kin-accent:var(--kin-risk-high)] [--kin-accent-hover:var(--kin-risk-high)]";

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" value="confirm" pending={pending} className={DANGER}>{label}</Button>;
}

/**
 * Confirmación con <dialog> nativo: showModal() ya atrapa el foco, cierra con Escape y devuelve el
 * foco al botón que lo abrió, así que no reimplemento nada de eso. Con `action` confirma una Server
 * Action ya ligada a su recurso; sin ella solo se cierra (la muestra de la guía).
 */
export function ConfirmDialog({ labels, action }: { labels: Labels; action?: () => Promise<void> }) {
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
        <form method={action ? undefined : "dialog"} action={action} className="grid gap-4 p-6">
          <h2 id={`${id}-title`} className="font-display text-xl font-semibold">{labels.title}</h2>
          <p id={`${id}-body`} className="text-sm text-ink-muted">{labels.body}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="quiet" autoFocus onClick={() => ref.current?.close()}>{labels.cancel}</Button>
            <ConfirmButton label={labels.confirm} />
          </div>
        </form>
      </dialog>
    </>
  );
}
