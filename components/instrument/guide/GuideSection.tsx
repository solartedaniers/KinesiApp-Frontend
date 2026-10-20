import type { ReactNode } from "react";

import { cssVars } from "@/lib/design/css";

/** Sección de la guía con la luz ambiental de su color y su título enlazado al índice. */
export function GuideSection({ id, title, lead, tint, children }: { id: string; title: string; lead?: string; tint: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="kin-tinted scroll-mt-24 border-t border-line py-12 sm:py-16" style={cssVars({ "--tint": tint })}>
      <div className="mx-auto grid max-w-content gap-8 px-4 sm:px-6">
        <header className="grid max-w-prose gap-3">
          <span className="h-1 w-12 rounded-full bg-(--tint) shadow-[0_0_14px_var(--tint)]" aria-hidden />
          <h2 id={`${id}-title`} className="font-display text-3xl font-bold tracking-tight text-ink">{title}</h2>
          {lead && <p className="text-lg text-ink-muted">{lead}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

/** Bloque dentro de una sección: un subtítulo y su muestra. */
export function Specimen({ title, lead, className = "", children }: { title: string; lead?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`grid content-start gap-4 ${className}`}>
      <div className="grid gap-1">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        {lead && <p className="text-sm text-ink-muted">{lead}</p>}
      </div>
      {children}
    </div>
  );
}
