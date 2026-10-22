import type { AiStatus, AiWakeOutcome } from "./protocol.ts";

type WakeOptions = { retryMs: number; attempts: number; sleep?: (ms: number) => Promise<void> };

// La espera es una task (setTimeout), no una microtask: entre intentos el navegador sigue pintando
const taskSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Llama a WakeUpAi hasta que la IA quede lista. WARMING_UP significa que el proceso ya responde pero
 * sigue cargando MediaPipe y YOLO: vuelvo a preguntar después de un rato, con un tope de intentos.
 */
export async function wakeUntilReady(wake: () => Promise<AiWakeOutcome>, { retryMs, attempts, sleep = taskSleep }: WakeOptions): Promise<AiStatus> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const outcome = await wake();
    if (outcome !== "warming_up") return outcome;
    if (attempt < attempts) await sleep(retryMs);
  }
  return "unavailable";
}
