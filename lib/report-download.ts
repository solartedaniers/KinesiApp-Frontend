import type { ReportModel } from "./report";

export const REPORT_WORKER_URL = "/workers/report-worker.js";

/** Bytes del PDF dibujado en el worker; null si falló. */
export function renderReportInWorker(model: ReportModel): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const worker = new Worker(REPORT_WORKER_URL, { type: "module" });
    const finish = (bytes: Uint8Array | null) => {
      worker.terminate();
      resolve(bytes);
    };
    worker.onmessage = (event: MessageEvent<Uint8Array | null>) => finish(event.data);
    worker.onerror = () => finish(null);
    worker.postMessage(model);
  });
}

/** Descarga los bytes con un enlace temporal; libero la URL en la siguiente task, cuando ya arrancó. */
export function saveFile(bytes: Uint8Array, name: string, type: string): void {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url));
}
