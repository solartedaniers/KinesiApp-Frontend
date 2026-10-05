"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/lib/i18n/client";

/** Abre el diálogo de impresión del navegador, donde se elige "Guardar como PDF". */
export function PrintButton() {
  const t = useT();
  return (
    <Button type="button" onClick={() => window.print()}>
      <Icon name="upload" size={18} />
      {t.report.download}
    </Button>
  );
}
