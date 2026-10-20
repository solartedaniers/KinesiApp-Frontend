// Subida de archivos del navegador directo al bucket privado con la URL firmada que entrega un RPC:
// no pasa por Vercel (que corta los cuerpos grandes) y el token de sesión nunca llega al navegador.
import type { UploadTarget } from "./types.ts";

export type VideoFileError = "videoRequired" | "videoInvalidType" | "videoTooLarge";

/** Mismas reglas que aplica CreateVideoUpload (tipo y tamaño); el backend vuelve a validar. */
export function validateVideoFile(file: { type: string; size: number } | null, maxBytes: number): VideoFileError | null {
  if (!file || file.size === 0) return "videoRequired";
  if (!file.type.startsWith("video/")) return "videoInvalidType";
  return file.size > maxBytes ? "videoTooLarge" : null;
}

/** 104857600 → 100: el mensaje de error muestra el límite en MB. */
export function bytesToMegabytes(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export type UploadOutcome = { ok: true } | { ok: false; code: string };

export type BucketUpload = { done: Promise<UploadOutcome>; abort: () => void };

/** Código del cliente para una subida cancelada por el usuario. */
export const UPLOAD_ABORTED_CODE = "upload_aborted";

/**
 * PUT al bucket con XMLHttpRequest: es la única API del navegador que informa el progreso de subida
 * (xhr.upload.onprogress). Los headers firmados van tal cual. Nunca rechaza: un fallo es
 * `{ ok: false, code }` con "storage_unavailable", "network" o UPLOAD_ABORTED_CODE.
 */
export function uploadToBucket(target: UploadTarget, body: Blob, onProgress?: (fraction: number) => void): BucketUpload {
  const xhr = new XMLHttpRequest();
  const done = new Promise<UploadOutcome>((resolve) => {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300 ? { ok: true } : { ok: false, code: "storage_unavailable" });
    xhr.onerror = () => resolve({ ok: false, code: "network" });
    xhr.onabort = () => resolve({ ok: false, code: UPLOAD_ABORTED_CODE });
  });

  xhr.open("PUT", target.url);
  for (const [name, value] of Object.entries(target.headers)) xhr.setRequestHeader(name, value);
  xhr.send(body);
  return { done, abort: () => xhr.abort() };
}

/**
 * Duración del video con los metadatos que lee el propio navegador (<video preload="metadata">).
 * CreateVideoUpload la exige para rechazar de entrada lo que pase de 40 s.
 */
export function readVideoDurationMs(file: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const finish = (settle: () => void) => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      settle();
    };
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      finish(() => (Number.isFinite(video.duration) ? resolve(Math.round(video.duration * 1000)) : reject(new Error("unknown duration"))));
    video.onerror = () => finish(() => reject(new Error("unreadable video")));
    video.src = url;
  });
}
