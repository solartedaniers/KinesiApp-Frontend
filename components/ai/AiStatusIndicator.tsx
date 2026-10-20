"use client";

import { AiStatus } from "@/components/instrument/Status";
import { useAiStatus, useWakeAiAfterLogin } from "@/lib/ai-status/use-ai-status";
import { useT } from "@/lib/i18n/client";

/**
 * Aviso "IA encendiendo… / IA activada" de la barra de la app. La región viva existe siempre, vacía en
 * reposo, para que el lector de pantalla anuncie cada cambio; los textos salen del estado compartido.
 */
export function AiStatusIndicator({ withHint = false }: { withHint?: boolean }) {
  useWakeAiAfterLogin();
  const status = useAiStatus();
  const t = useT().ai;
  const hint = status === "waking" ? t.wakingHint : status === "unavailable" ? t.unavailableHint : undefined;
  return (
    <div role="status" aria-label={t.label} className="empty:hidden">
      {status !== "idle" && <AiStatus state={status} label={t[status]} hint={withHint ? hint : undefined} live={false} />}
    </div>
  );
}
