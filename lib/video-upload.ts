// Subida de un video del navegador directo a la API (no pasa por Vercel, que corta los cuerpos
// grandes). Lo autoriza un token de subida de vida corta, acotado a un deportista: el token de
// sesión nunca llega al navegador.
import type { MovementType } from "./types.ts";

export type VideoFileError = "videoRequired" | "videoInvalidType" | "videoTooLarge";

/** Mismas reglas que JumpVideoStorage del backend (tipo y tamaño); el backend vuelve a validar. */
export function validateVideoFile(file: { type: string; size: number } | null, maxBytes: number): VideoFileError | null {
  if (!file || file.size === 0) return "videoRequired";
  if (!file.type.startsWith("video/")) return "videoInvalidType";
  return file.size > maxBytes ? "videoTooLarge" : null;
}

/** 104857600 → 100: el mensaje de error muestra el límite en MB. */
export function bytesToMegabytes(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export type UploadOutcome = { ok: true; analysisId: number } | { ok: false; code: string };

export type VideoUpload = { done: Promise<UploadOutcome>; abort: () => void };

/** Código del cliente para una subida cancelada por el usuario. */
export const UPLOAD_ABORTED_CODE = "upload_aborted";

/**
 * POST multipart con XMLHttpRequest: es la única API del navegador que informa el progreso de
 * subida (xhr.upload.onprogress). Nunca rechaza: un fallo es `{ ok: false, code }` con el `code`
 * estable del backend, o "network" / UPLOAD_ABORTED_CODE.
 */
export function startVideoUpload({
  url,
  token,
  athleteId,
  movementType,
  file,
  onProgress,
}: {
  url: string;
  token: string;
  athleteId: number;
  movementType: MovementType;
  file: File;
  onProgress: (fraction: number) => void;
}): VideoUpload {
  const xhr = new XMLHttpRequest();
  const done = new Promise<UploadOutcome>((resolve) => {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      const body = parseJson(xhr.responseText);
      if (xhr.status === 202 && typeof body?.id === "number") resolve({ ok: true, analysisId: body.id });
      else resolve({ ok: false, code: typeof body?.code === "string" ? body.code : xhr.status === 422 ? "validation_error" : "generic" });
    };
    xhr.onerror = () => resolve({ ok: false, code: "network" });
    xhr.onabort = () => resolve({ ok: false, code: UPLOAD_ABORTED_CODE });
  });

  const form = new FormData();
  form.set("athlete_id", String(athleteId));
  form.set("movement_type", movementType);
  form.set("video", file);
  xhr.open("POST", url);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  xhr.send(form);
  return { done, abort: () => xhr.abort() };
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}
