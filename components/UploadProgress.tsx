"use client";

import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";

import styles from "./UploadProgress.module.css";

/** Barra de progreso de la subida: <progress> nativo, que los lectores de pantalla ya anuncian. */
export function UploadProgress({ fraction }: { fraction: number }) {
  const t = useT();
  const fmt = useFormat();
  return (
    <div className={styles.wrapper}>
      <progress className={styles.bar} value={fraction} max={1} aria-label={t.capture.uploading} />
      <p className={styles.label} aria-live="polite">
        {format(t.capture.progress, { percent: fmt.percent(fraction) })}
      </p>
    </div>
  );
}
