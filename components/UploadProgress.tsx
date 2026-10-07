"use client";

import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";

const styles = {
  wrapper: "grid gap-2",
  bar: "h-2.5 w-full appearance-none overflow-hidden rounded-full border-0 bg-sunken [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-sunken [&::-webkit-progress-value]:bg-accent [&::-webkit-progress-value]:transition-[width]",
  label: "text-sm tabular-nums text-ink-muted",
};

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
