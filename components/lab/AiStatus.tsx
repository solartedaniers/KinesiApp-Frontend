export type AiState = "waking" | "ready" | "unavailable";

const styles = {
  root: "inline-flex min-h-11 items-center gap-3 rounded-tag bg-panel py-2 pr-4 pl-3",
  mark: "relative grid size-5 flex-none place-items-center",
  text: "grid leading-tight",
  label: "text-sm font-semibold text-ink",
  hint: "text-xs text-ink-muted",
};

const MARKS: Record<AiState, string> = {
  // Despertando: un keypoint que late; activada: sólido; sin respuesta: hueco, en tinta
  waking: "lab-ai-waking size-2.5 rounded-full bg-accent",
  ready: "size-2.5 rounded-full bg-accent shadow-[0_0_0_4px_var(--kin-accent-soft)]",
  unavailable: "size-2.5 rounded-full shadow-[inset_0_0_0_1.5px_var(--kin-ink)]",
};

/** Estado de la IA que dispara WakeUpAi al iniciar sesión. Es una región viva: se anuncia al cambiar. */
export function AiStatus({ state, label, hint }: { state: AiState; label: string; hint?: string }) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <span className={styles.mark} aria-hidden>
        <span className={MARKS[state]} />
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
    </div>
  );
}
