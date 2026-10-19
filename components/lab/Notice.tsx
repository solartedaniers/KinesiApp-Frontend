import type { ReactNode } from "react";

import { LabIcon } from "./LabIcon";

type Tone = "info" | "error";

const styles = {
  root: "flex items-start gap-3 rounded-tag px-4 py-3 text-base",
  tones: {
    info: "bg-accent-soft text-ink [&>svg]:text-accent",
    // El error se marca con forma y peso, no con rojo, que es del riesgo
    error: "bg-panel font-semibold text-ink shadow-[inset_3px_0_0_var(--kin-ink)]",
  } satisfies Record<Tone, string>,
};

/** Aviso en línea. Los errores usan role="alert" para que se anuncien en cuanto aparecen. */
export function Notice({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div className={`${styles.root} ${styles.tones[tone]}`} role={tone === "error" ? "alert" : "status"}>
      <LabIcon name={tone === "error" ? "alert" : "info"} size={20} className="mt-0.5 flex-none" />
      <p>{children}</p>
    </div>
  );
}
