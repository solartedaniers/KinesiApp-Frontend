// Lado de la UI de la foto de perfil: la comprime en un Web Worker (para no congelar la pantalla
// con fotos de 12 MP) y la deja lista para subirla directo al bucket.
import { AVATAR_COMPRESSION, AVATAR_WORKER_URL, canUploadOriginal } from "./avatar";

export class AvatarTooLargeError extends Error {}

type WorkerReply = { ok: true; blob: Blob } | { ok: false; tooLarge: boolean };

function compressInWorker(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(AVATAR_WORKER_URL, { type: "module" });
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      worker.terminate();
      if (event.data.ok) resolve(event.data.blob);
      else reject(event.data.tooLarge ? new AvatarTooLargeError() : new Error("compression failed"));
    };
    worker.onerror = () => {
      worker.terminate();
      reject(new Error("compression failed"));
    };
    worker.postMessage({ file, config: AVATAR_COMPRESSION });
  });
}

/** Foto lista para enviar: comprimida en el worker o, sin soporte, la original si ya cumple. */
export async function prepareAvatar(file: File): Promise<Blob> {
  if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") {
    const blob = await compressInWorker(file);
    return blob.type ? blob : new Blob([blob], { type: AVATAR_COMPRESSION.outputType });
  }
  if (!canUploadOriginal(file)) throw new AvatarTooLargeError();
  return file;
}
