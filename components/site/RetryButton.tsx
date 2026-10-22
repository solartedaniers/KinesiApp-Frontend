"use client";

import { Button } from "@/components/instrument/Button";

/** Recarga la página que falló: el Service Worker sirve esta pantalla en su lugar, con la misma URL. */
export function RetryButton({ label }: { label: string }) {
  return (
    <Button glyph="history" onClick={() => location.reload()}>
      {label}
    </Button>
  );
}
