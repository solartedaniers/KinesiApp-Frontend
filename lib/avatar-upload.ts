// Lado de la UI de la foto de perfil: la comprime en un Web Worker (para no congelar la pantalla
// con fotos de 12 MP) y la deja lista para la Server Action.
import { AVATAR_COMPRESSION, AVATAR_WORKER_URL, type AvatarPayload, canUploadOriginal } from "./avatar";

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
export async function prepareAvatar(file: File): Promise<AvatarPayload> {
  if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") {
    const blob = await compressInWorker(file);
    return { content_type: AVATAR_COMPRESSION.outputType, data_base64: await blobToBase64(blob) };
  }
  if (!canUploadOriginal(file)) throw new AvatarTooLargeError();
  return { content_type: file.type, data_base64: await blobToBase64(file) };
}

/** Blob → base64 sin el prefijo "data:...;base64," (el backend recibe tipo y datos por separado). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
