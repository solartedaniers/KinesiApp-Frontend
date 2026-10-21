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
export const UPLOAD_ABORTED_CODE = "UPLOAD_ABORTED";

/**
 * PUT al bucket con XMLHttpRequest: es la única API del navegador que informa el progreso de subida
 * (xhr.upload.onprogress). Los headers firmados van tal cual. Nunca rechaza: un fallo es
 * `{ ok: false, code }` con "STORAGE_UNAVAILABLE", "NETWORK" o UPLOAD_ABORTED_CODE.
 */
export function uploadToBucket(target: UploadTarget, body: Blob, onProgress?: (fraction: number) => void): BucketUpload {
  const xhr = new XMLHttpRequest();
  const done = new Promise<UploadOutcome>((resolve) => {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300 ? { ok: true } : { ok: false, code: "STORAGE_UNAVAILABLE" });
    xhr.onerror = () => resolve({ ok: false, code: "NETWORK" });
    xhr.onabort = () => resolve({ ok: false, code: UPLOAD_ABORTED_CODE });
  });

  xhr.open("PUT", target.url);
  for (const [name, value] of Object.entries(target.headers)) xhr.setRequestHeader(name, value);
  xhr.send(body);
  return { done, abort: () => xhr.abort() };
}

export type VideoMetadata = { durationMs: number; width: number; height: number; container: string | null };

export const VIDEO_METADATA_WORKER_URL = "/workers/video-metadata-worker.js";

type WorkerReading = { durationMs: number | null; width: number; height: number; container: string } | null;

function readInWorker(file: Blob): Promise<WorkerReading> {
  return new Promise((resolve) => {
    const worker = new Worker(VIDEO_METADATA_WORKER_URL, { type: "module" });
    const finish = (reading: WorkerReading) => {
      worker.terminate();
      resolve(reading);
    };
    worker.onmessage = (event: MessageEvent<WorkerReading>) => finish(event.data);
    worker.onerror = () => finish(null);
    worker.postMessage(file);
  });
}

/** Respaldo con lo que lee el propio navegador (<video preload="metadata">). */
function readWithVideoElement(file: Blob): Promise<{ durationMs: number | null; width: number; height: number }> {
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
      finish(() => resolve({ durationMs: Number.isFinite(video.duration) ? Math.round(video.duration * 1000) : null, width: video.videoWidth, height: video.videoHeight }));
    video.onerror = () => finish(() => reject(new Error("unreadable video")));
    video.src = url;
  });
}

/**
 * Duración, resolución y contenedor. Primero el lector propio en un Web Worker; si no entiende el
 * archivo o no trae duración, el <video> del navegador. `recordedMs` es lo que midió la grabación:
 * el WebM de MediaRecorder no trae duración y Chrome la informa como Infinity.
 */
export async function readVideoMetadata(file: Blob, recordedMs?: number): Promise<VideoMetadata | null> {
  const worker = typeof Worker === "undefined" ? null : await readInWorker(file);
  if (worker?.durationMs != null && worker.width) return { ...worker, durationMs: worker.durationMs };
  const element = await readWithVideoElement(file).catch(() => null);
  const durationMs = element?.durationMs ?? worker?.durationMs ?? recordedMs ?? null;
  if (durationMs === null) return null;
  return { durationMs, width: element?.width || worker?.width || 0, height: element?.height || worker?.height || 0, container: worker?.container ?? null };
}
