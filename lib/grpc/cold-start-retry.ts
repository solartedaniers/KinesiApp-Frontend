import { createContextKey, type Transport } from "@connectrpc/connect";

import { isServerAsleep } from "./errors.ts";

export type ColdStartRetryOptions = {
  firstDelayMs: number;
  maxDelayMs: number;
  /** Tope de toda la espera: pasado esto, dejo subir el último 503. */
  maxWaitMs: number;
  sleep?: (ms: number, signal: AbortSignal | undefined) => Promise<void>;
  now?: () => number;
};

/** Llamadas que no deben esperar a Render, como el ping que solo sirve para despertarlo. */
export const SKIP_COLD_START_RETRY = createContextKey(false, { description: "skip cold start retry" });

const abortableSleep = (ms: number, signal: AbortSignal | undefined) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });

/**
 * Decorator del transporte: si el backend responde que todavía está despertando, repito la llamada unaria con
 * espera creciente hasta que despierte. Envuelvo el transporte y no uso un interceptor porque el deadline
 * nace dentro del transporte: así cada intento tiene su propio plazo y no se lo come la espera.
 * Los streams no se repiten: el progreso del análisis y el chat ya tienen su propio manejo.
 */
export function withColdStartRetry(transport: Transport, options: ColdStartRetryOptions): Transport {
  const { firstDelayMs, maxDelayMs, maxWaitMs, sleep = abortableSleep, now = Date.now } = options;
  return {
    async unary(method, signal, timeoutMs, header, input, contextValues) {
      const skip = contextValues?.get(SKIP_COLD_START_RETRY) ?? false;
      const startedAt = now();
      for (let delay = firstDelayMs; ; delay = Math.min(delay * 2, maxDelayMs)) {
        try {
          return await transport.unary(method, signal, timeoutMs, header, input, contextValues);
        } catch (error) {
          if (skip || !isServerAsleep(error) || now() - startedAt + delay > maxWaitMs) throw error;
          console.warn(`Backend answered HTTP 503 while waking up; retrying ${method.name} in ${delay} ms`);
          await sleep(delay, signal);
        }
      }
    },
    stream: (method, signal, timeoutMs, header, input, contextValues) =>
      transport.stream(method, signal, timeoutMs, header, input, contextValues),
  };
}
