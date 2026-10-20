import type { ReactNode } from "react";

import { Glyph } from "./Glyph";

import { cssVars } from "@/lib/design/css";

const styles = {
  box: "kin-card kin-tinted grid justify-items-center gap-3 px-5 py-8 text-center",
  title: "font-display text-xl font-semibold text-ink",
  body: "max-w-prose text-sm text-ink-muted",
};

/** Esfera en cero: el vacío se dice con el mismo instrumento, sin ilustraciones genéricas. */
function IdleDial() {
  return (
    <svg viewBox="0 0 80 56" className="h-14 w-20" aria-hidden>
      <path d="M12 48a28 28 0 0 1 56 0" className="fill-none stroke-line-strong" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 8" />
      <path d="M40 48L17 38" className="stroke-knee" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="40" cy="48" r="4" className="fill-knee" />
    </svg>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <section className={styles.box}>
      <IdleDial />
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.body}>{body}</p>
      {action}
    </section>
  );
}

/** Carga con la forma de lo que viene: un medidor y tres renglones con brillo que barre. */
export function LoadingState({ label }: { label: string }) {
  return (
    <div className="kin-card grid grid-cols-[4.5rem_1fr] items-center gap-4 p-5" role="status" aria-label={label}>
      <span className="kin-shimmer aspect-square rounded-full" />
      <span className="grid gap-2.5">
        <span className="kin-shimmer h-3.5 w-3/5 rounded-full" />
        <span className="kin-shimmer h-3 w-full rounded-full" />
        <span className="kin-shimmer h-3 w-4/5 rounded-full" />
      </span>
    </div>
  );
}

export function ErrorState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <section className={styles.box} style={cssVars({ "--tint": "var(--kin-risk-high)" })} role="alert">
      <span className="grid size-12 place-items-center rounded-full bg-risk-high-soft text-risk-high"><Glyph name="alert" size={24} /></span>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.body}>{body}</p>
      {action}
    </section>
  );
}
