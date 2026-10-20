// Estado de la IA que comparten las pestañas y mensajes entre ellas y el Shared Worker.
import type { AiState } from "../types.ts";

export type AiStatus = "idle" | "waking" | "ready" | "unavailable";
export type AiWakeOutcome = AiState | "unavailable";
// `version` sube con cada cambio: el worker solo acepta un "claim" sobre la versión que la pestaña vio
export type AiStatusState = { status: AiStatus; at: number; version: number };
export type AiStatusTimings = { readyTtlMs: number; wakeStaleMs: number };

export const IDLE: AiStatusState = { status: "idle", at: 0, version: 0 };

/** Pestaña → worker: pedir el turno de llamar (sobre la versión vista), informar el resultado o despedirse. */
export type ToCoordinator = { type: "claim"; version: number } | { type: "result"; status: AiStatus } | { type: "bye" };

/** Worker → pestaña: el estado vigente, o el turno concedido para hacer la llamada. */
export type FromCoordinator = { type: "state"; state: AiStatusState } | { type: "perform" };

/**
 * ¿El estado sigue valiendo? Un "activada" vence antes de que Azure baje la réplica y un "encendiendo"
 * viejo se da por perdido. Así decido si hace falta otra llamada a WakeUpAi.
 */
export function isFresh(state: AiStatusState, timings: AiStatusTimings, now: number): boolean {
  const age = now - state.at;
  if (state.status === "ready") return age < timings.readyTtlMs;
  if (state.status === "waking") return age < timings.wakeStaleMs;
  return false;
}

/** Lo que se muestra: cada aviso dura lo mismo que su vigencia y después desaparece ("idle"). */
export function visibleStatus(state: AiStatusState, timings: AiStatusTimings, now: number): AiStatus {
  const lifetime = state.status === "waking" ? timings.wakeStaleMs : timings.readyTtlMs;
  return state.status !== "idle" && now - state.at < lifetime ? state.status : "idle";
}

/** Momento en que el aviso visible vence, para volver a pintar justo entonces. */
export function visibleUntil(state: AiStatusState, timings: AiStatusTimings): number | null {
  if (state.status === "idle") return null;
  return state.at + (state.status === "waking" ? timings.wakeStaleMs : timings.readyTtlMs);
}
