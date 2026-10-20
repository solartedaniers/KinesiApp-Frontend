"use client";

import { useEffect, useSyncExternalStore } from "react";

import { wakeUpAi } from "../actions/system";
import { AI_STATUS, AI_WAKE_COOKIE } from "../config";
import { readPreference } from "../preference-cookie";
import { type AiStatusChannel, createAiStatusChannel } from "./channels";
import { type AiStatus, visibleStatus, visibleUntil } from "./protocol";
import { wakeUntilReady } from "./wake";

const timings = { readyTtlMs: AI_STATUS.readyTtlMs, wakeStaleMs: AI_STATUS.wakeStaleMs };

async function perform(): Promise<AiStatus> {
  try {
    return await wakeUntilReady(wakeUpAi, { retryMs: AI_STATUS.warmingRetryMs, attempts: AI_STATUS.warmingAttempts });
  } catch {
    // Sin red la Server Action lanza: no dejo el estado colgado en "encendiendo"
    return "unavailable";
  }
}

// Un solo canal por pestaña, creado la primera vez que algún componente lo necesita
let channel: AiStatusChannel | null = null;
const aiChannel = () => (channel ??= createAiStatusChannel(perform, timings));

const listeners = new Set<() => void>();
let unsubscribeChannel: (() => void) | null = null;
let expiry: ReturnType<typeof setTimeout> | undefined;

// Vuelvo a avisar justo cuando vence el aviso visible, para que desaparezca sin esperar otro cambio
function emit() {
  clearTimeout(expiry);
  const until = visibleUntil(aiChannel().current(), timings);
  if (until !== null && until > Date.now()) expiry = setTimeout(emit, until - Date.now());
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  unsubscribeChannel ??= aiChannel().onChange(emit);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      unsubscribeChannel?.();
      unsubscribeChannel = null;
      clearTimeout(expiry);
    }
  };
}

const snapshot = (): AiStatus => visibleStatus(aiChannel().current(), timings, Date.now());

/** Estado visible de la IA, igual en todas las pestañas. En el servidor siempre es "idle". */
export function useAiStatus(): AiStatus {
  return useSyncExternalStore(subscribe, snapshot, () => "idle");
}

/** Despierta la IA al montar el componente (si ya está activa o encendiéndose, no repite la llamada). */
export function useWakeAi(when = true): void {
  useEffect(() => {
    if (when) aiChannel().requestWake();
  }, [when]);
}

/** El login deja una cookie de un solo uso: la consumo y despierto la IA al entrar a la app. */
export function useWakeAiAfterLogin(): void {
  useEffect(() => {
    if (!readPreference(AI_WAKE_COOKIE)) return;
    document.cookie = `${AI_WAKE_COOKIE}=; path=/; max-age=0`;
    aiChannel().requestWake();
  }, []);
}
