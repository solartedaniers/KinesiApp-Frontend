import type { InputHTMLAttributes, ReactNode } from "react";

const styles = {
  row: "group flex min-h-11 cursor-pointer items-start gap-3 py-1.5 text-base text-ink",
  box: "relative mt-0.5 grid size-6 flex-none place-items-center rounded-tag bg-panel shadow-[inset_0_0_0_1.5px_var(--kin-line-strong)] transition-[background-color,box-shadow] duration-[var(--kin-motion-hover)] group-has-[:checked]:bg-accent group-has-[:checked]:shadow-none group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-accent",
  input: "peer absolute inset-0 m-0 cursor-pointer opacity-0",
  check: "lab-check pointer-events-none stroke-on-accent opacity-0 peer-checked:opacity-100",
};

/** Checkbox nativo con la palomita trazada al marcarlo; funciona y valida sin JavaScript. */
export function LabCheckbox({ children, ...input }: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label className={styles.row}>
      <span className={styles.box}>
        <input type="checkbox" className={styles.input} {...input} />
        <svg className={styles.check} width={16} height={16} viewBox="0 0 24 24" fill="none" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path pathLength={1} d="M4.5 12.5l4.5 4.5 10.5-10.5" />
        </svg>
      </span>
      <span>{children}</span>
    </label>
  );
}
