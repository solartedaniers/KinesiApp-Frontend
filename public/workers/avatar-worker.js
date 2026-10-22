// Web Worker de la foto de perfil: decodificar y escalar una foto de varios megapíxeles no
// bloquea el hilo principal. Es un módulo servido tal cual desde public/: el bundler de Next
// (Turbopack) no empaqueta workers declarados con new Worker(new URL(...)).
// Sin valores fijos: el tamaño, el peso máximo y las calidades llegan en cada mensaje desde
// lib/avatar.ts, la única fuente de esa configuración.

/** Escala para que el lado mayor no pase de `max`, sin agrandar fotos más chicas. */
export function scaledSize(width, height, max) {
  const ratio = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
}

async function compress(file, { maxDimension, maxBytes, qualities, outputType }) {
  // imageOrientation: la foto queda derecha aunque el celular la haya guardado rotada (EXIF)
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height } = scaledSize(bitmap.width, bitmap.height, maxDimension);
  const canvas = new OffscreenCanvas(width, height);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  for (const quality of qualities) {
    const blob = await canvas.convertToBlob({ type: outputType, quality });
    if (blob.size <= maxBytes) return blob;
  }
  return null;
}

const positive = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;

/** La foto y la configuración de compresión que manda lib/avatar.ts; lo demás se descarta. */
export function isCompressRequest(data) {
  const config = data?.config;
  return (
    data?.file instanceof Blob &&
    positive(config?.maxDimension) &&
    positive(config?.maxBytes) &&
    Array.isArray(config.qualities) &&
    config.qualities.length > 0 &&
    config.qualities.every((quality) => positive(quality) && quality <= 1) &&
    typeof config.outputType === "string" &&
    config.outputType.startsWith("image/")
  );
}

// En Node (tests) no hay `self`: sólo se exportan scaledSize e isCompressRequest
if (typeof self !== "undefined") {
  self.onmessage = async (event) => {
    if (!isCompressRequest(event.data)) return self.postMessage({ ok: false, tooLarge: false });
    try {
      const blob = await compress(event.data.file, event.data.config);
      self.postMessage(blob ? { ok: true, blob } : { ok: false, tooLarge: true });
    } catch {
      self.postMessage({ ok: false, tooLarge: false });
    }
  };
}
