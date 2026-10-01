import type { CSSProperties } from "react";

import styles from "./StepIndicator.module.css";

/** Barra de progreso de un flujo por pasos; `current` empieza en 1. */
export function StepIndicator({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className={styles.steps}>
      <div
        className={styles.bars}
        style={{ "--step-count": total } as CSSProperties}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={label}
      >
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={`${styles.bar} ${index < current ? styles.done : ""}`} />
        ))}
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
