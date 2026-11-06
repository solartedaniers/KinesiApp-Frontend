"use client";

import { useEffect, useRef, useState } from "react";

import { FormAlert } from "@/components/ui/FormAlert";
import { wakeServer } from "@/lib/actions/system";
import { SERVER_WAKE_NOTICE_DELAY_MS } from "@/lib/config";
import { useT } from "@/lib/i18n/client";

/** Aviso de que Render está despertando: solo aparece si la espera ya es más larga que una respuesta normal. */
export function ServerWakeNotice({ pending }: { pending: boolean }) {
  // Lo monto solo mientras espero: al terminar se desmonta y el próximo envío vuelve a contar desde cero
  return pending ? <DelayedNotice /> : null;
}

function DelayedNotice() {
  const t = useT();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SERVER_WAKE_NOTICE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return visible ? <FormAlert tone="info">{t.session.serverWaking}</FormAlert> : null;
}

/**
 * Despierta a Render la primera vez que la persona escribe en el formulario. Uso el evento input y no la
 * carga de la página: un bot que solo visita no escribe, así que no despierta al backend.
 */
export function useWakeServerOnInput(): () => void {
  const sent = useRef(false);
  return () => {
    if (sent.current) return;
    sent.current = true;
    void wakeServer();
  };
}
