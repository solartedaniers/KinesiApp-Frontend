// Reglas de la foto de perfil: única fuente de la configuración que usan la UI y el Web Worker
// (public/workers/avatar-worker.js, que la recibe en cada mensaje). Lógica pura.

// Igual a MAX_AVATAR_BYTES y a los tipos de AvatarUpload del backend (app/schemas/avatar.py)
export const AVATAR_MAX_BYTES = 1_000_000;
export const AVATAR_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const AVATAR_WORKER_URL = "/workers/avatar-worker.js";

export const AVATAR_COMPRESSION = {
  // Lado mayor de la foto ya escalada: suficiente para un avatar nítido en pantallas densas
  maxDimension: 512,
  maxBytes: AVATAR_MAX_BYTES,
  // Calidades JPEG que se prueban en orden hasta que la foto quepa en maxBytes
  qualities: [0.86, 0.75, 0.6, 0.45],
  outputType: "image/jpeg",
} as const;

export type AvatarPayload = { content_type: string; data_base64: string };

export function isImageFile(file: { type: string } | null): boolean {
  return file !== null && file.type.startsWith("image/");
}

/** Sin worker (navegadores sin OffscreenCanvas) sólo se puede subir la foto original si ya cumple. */
export function canUploadOriginal(file: { type: string; size: number }): boolean {
  return (AVATAR_UPLOAD_TYPES as readonly string[]).includes(file.type) && file.size <= AVATAR_MAX_BYTES;
}
