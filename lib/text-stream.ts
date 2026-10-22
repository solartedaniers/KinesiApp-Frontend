/**
 * Junta los fragmentos de texto que llegan en la misma task y los entrega en un solo flush. Cada
 * `for await` resuelve en su propia microtask: con queueMicrotask el flush corre después de todas las
 * del lote y antes de que el navegador pinte, así React recibe un solo cambio por lote.
 */
export function createTextBatcher(flush: (text: string) => void): { push: (text: string) => void } {
  let pending = "";
  let scheduled = false;
  return {
    push(text: string) {
      pending += text;
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        const batch = pending;
        pending = "";
        flush(batch);
      });
    },
  };
}
