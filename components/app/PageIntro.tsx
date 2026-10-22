import type { ReactNode } from "react";

/** Título grande de la pantalla, su frase y, opcional, la acción principal a la derecha (abajo en el celular). */
export function PageIntro({ title, lead, action }: { title: ReactNode; lead?: ReactNode; action?: ReactNode }) {
  return (
    <section aria-labelledby="page-title" className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-2">
        <h1 id="page-title" className="font-display text-hero font-bold tracking-tight text-ink [overflow-wrap:anywhere]">{title}</h1>
        {typeof lead === "string" ? <p className="max-w-prose text-lg text-ink-muted">{lead}</p> : lead}
      </div>
      {action}
    </section>
  );
}
