// Web Worker que lee los metadatos del video (duración, resolución y contenedor) sin decodificarlo:
// recorre las cajas de MP4/MOV (moov → mvhd, tkhd) o los elementos EBML de WebM (Info → Duration,
// Tracks → PixelWidth/PixelHeight). Lo hago aquí porque un video de 100 MB se lee por partes y no
// quiero que la página se trabe mientras tanto. Es un módulo servido tal cual desde public/, como
// avatar-worker.js. Devuelve null si no lo entiende; entonces la página usa <video preload=metadata>.

// Leo de a pedazos: los metadatos de un MP4 suelen estar al principio o al final, nunca hace falta todo
const CHUNK = 1 << 20;

async function bytes(file, start, length) {
  return new Uint8Array(await file.slice(start, start + length).arrayBuffer());
}

const u32 = (b, i) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const type = (b, i) => String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);

// ---------- MP4 / MOV ----------

/** Recorre las cajas de [start, end) y devuelve la primera con ese tipo. */
async function findBox(file, start, end, wanted) {
  let at = start;
  while (at + 8 <= end) {
    const head = await bytes(file, at, 16);
    let size = u32(head, 0);
    let header = 8;
    if (size === 1) {
      size = u32(head, 8) * 2 ** 32 + u32(head, 12);
      header = 16;
    } else if (size === 0) size = end - at;
    if (size < header) return null;
    if (type(head, 4) === wanted) return { start: at + header, end: at + size };
    at += size;
  }
  return null;
}

/** Duración de mvhd y, de la primera pista con tamaño, su ancho y alto (16.16 de punto fijo). */
async function readMp4(file, brand) {
  const moov = await findBox(file, 0, file.size, "moov");
  if (!moov) return null;
  const body = await bytes(file, moov.start, Math.min(moov.end - moov.start, 8 * CHUNK));
  const local = (start, end, wanted) => {
    for (let at = start; at + 8 <= end; ) {
      const size = u32(body, at);
      if (size < 8) return null;
      if (type(body, at + 4) === wanted) return { start: at + 8, end: at + size };
      at += size;
    }
    return null;
  };
  const mvhd = local(0, body.length, "mvhd");
  if (!mvhd) return null;
  const v1 = body[mvhd.start] === 1;
  const scale = u32(body, mvhd.start + (v1 ? 20 : 12));
  const duration = v1 ? u32(body, mvhd.start + 24) * 2 ** 32 + u32(body, mvhd.start + 28) : u32(body, mvhd.start + 16);
  let width = 0;
  let height = 0;
  for (let at = 0; at + 8 <= body.length && !width; ) {
    const trak = local(at, body.length, "trak");
    if (!trak) break;
    const tkhd = local(trak.start, trak.end, "tkhd");
    if (tkhd) {
      const tail = tkhd.end - 8;
      width = u32(body, tail) / 65536;
      height = u32(body, tail + 4) / 65536;
    }
    at = trak.end;
  }
  return { durationMs: scale ? Math.round((duration / scale) * 1000) : null, width, height, container: brand === "qt  " ? "mov" : "mp4" };
}

// ---------- WebM (EBML) ----------

const EBML = { segment: 0x18538067, info: 0x1549a966, timecodeScale: 0x2ad7b1, duration: 0x4489, tracks: 0x1654ae6b, trackEntry: 0xae, video: 0xe0, width: 0xb0, height: 0xba };
const CONTAINERS = new Set([EBML.segment, EBML.info, EBML.tracks, EBML.trackEntry, EBML.video]);

/** Lee un número de largo variable (vint). `keepMarker` deja el bit de largo, como en los ids. */
function vint(b, i, keepMarker) {
  const first = b[i];
  let length = 1;
  while (length <= 8 && !(first & (0x80 >> (length - 1)))) length++;
  if (length > 8) return null;
  let value = keepMarker ? first : first & (0xff >> length);
  for (let k = 1; k < length; k++) value = value * 256 + b[i + k];
  // Todos los bits en 1 es "tamaño desconocido": lo trato como "hasta el final"
  const unknown = !keepMarker && value === 2 ** (7 * length) - 1;
  return { value: unknown ? Infinity : value, length };
}

function readUint(b, i, size) {
  let value = 0;
  for (let k = 0; k < size; k++) value = value * 256 + b[i + k];
  return value;
}

function readFloat(b, i, size) {
  const view = new DataView(b.buffer, b.byteOffset + i, size);
  return size === 4 ? view.getFloat32(0) : view.getFloat64(0);
}

async function readWebm(file) {
  const b = await bytes(file, 0, Math.min(file.size, 4 * CHUNK));
  let scale = 1_000_000;
  let duration = null;
  let width = 0;
  let height = 0;
  for (let i = 0; i < b.length; ) {
    const id = vint(b, i, true);
    if (!id) break;
    const size = vint(b, i + id.length, false);
    if (!size) break;
    const data = i + id.length + size.length;
    if (CONTAINERS.has(id.value)) {
      i = data;
      continue;
    }
    if (id.value === EBML.timecodeScale) scale = readUint(b, data, size.value);
    if (id.value === EBML.duration) duration = readFloat(b, data, size.value);
    if (id.value === EBML.width && !width) width = readUint(b, data, size.value);
    if (id.value === EBML.height && !height) height = readUint(b, data, size.value);
    // Los clústeres traen los cuadros: ahí ya no quedan metadatos
    if (id.value === 0x1f43b675 || !Number.isFinite(size.value)) break;
    i = data + size.value;
  }
  // MediaRecorder escribe WebM sin Duration: queda en null y la página usa lo que midió al grabar
  return { durationMs: duration === null ? null : Math.round((duration * scale) / 1_000_000), width, height, container: "webm" };
}

/** Metadatos del archivo o null si no es un contenedor que entienda. */
export async function readVideoMetadata(file) {
  const head = await bytes(file, 0, 12);
  if (u32(head, 0) === 0x1a45dfa3) return readWebm(file);
  if (type(head, 4) === "ftyp") return readMp4(file, type(head, 8));
  return null;
}

/** Solo acepto el archivo; cualquier otro mensaje se responde como un video que no entiendo. */
export function isVideoFile(data) {
  return data instanceof Blob;
}

// En Node (tests) no hay `self`: sólo se exportan readVideoMetadata e isVideoFile
if (typeof self !== "undefined") {
  self.onmessage = async (event) => {
    try {
      self.postMessage(isVideoFile(event.data) ? await readVideoMetadata(event.data) : null);
    } catch {
      self.postMessage(null);
    }
  };
}
