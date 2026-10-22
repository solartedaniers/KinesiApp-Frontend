import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { AVATAR_COMPRESSION, AVATAR_WORKER_URL } from "../lib/avatar";
import { es } from "./dictionaries";

// Las mismas URLs que usa la app: los workers se sirven tal cual desde public/
const VIDEO_METADATA_WORKER_URL = "/workers/video-metadata-worker.js";
const AI_STATUS_WORKER_URL = "/workers/ai-status-worker.js";

// Los mismos videos chicos de las pruebas unitarias (1,5 s a 64×48)
// Playwright corre desde la raíz del repo, donde está su configuración
const fixture = (name: string) => [...readFileSync(`lib/__fixtures__/${name}`)];

for (const [name, container] of [["clip.mp4", "mp4"], ["clip.mov", "mov"], ["clip.webm", "webm"]] as const) {
  test(`el Web Worker lee la duración y la resolución de ${name}`, async ({ page }) => {
    await page.goto("/");
    const reading = await page.evaluate(
      ([url, bytes]) =>
        new Promise((resolve) => {
          const worker = new Worker(url, { type: "module" });
          worker.onmessage = ({ data }) => resolve(data);
          worker.postMessage(new Blob([new Uint8Array(bytes)]));
        }),
      [VIDEO_METADATA_WORKER_URL, fixture(name)] as const,
    );
    expect(reading).toEqual({ durationMs: 1500, width: 64, height: 48, container });
  });
}

test("el Web Worker del avatar reduce una foto grande a JPEG", async ({ page }) => {
  await page.goto("/");
  // Sin OffscreenCanvas la app sube la foto original si ya cumple (lib/avatar-upload.ts)
  test.skip(!(await page.evaluate(() => "OffscreenCanvas" in window)), "Este navegador no tiene OffscreenCanvas");
  const result = await page.evaluate(
    ([url, config]) =>
      new Promise<{ ok: boolean; type?: string; side?: number }>((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 2400;
        canvas.height = 1600;
        const context = canvas.getContext("2d")!;
        context.fillStyle = "#3a7";
        context.fillRect(0, 0, canvas.width, canvas.height);
        canvas.toBlob((file) => {
          const worker = new Worker(url, { type: "module" });
          worker.onmessage = async ({ data }) => {
            if (!data.ok) return resolve({ ok: false });
            const bitmap = await createImageBitmap(data.blob);
            resolve({ ok: true, type: data.blob.type, side: Math.max(bitmap.width, bitmap.height) });
          };
          worker.postMessage({ file, config });
        }, "image/png");
      }),
    [AVATAR_WORKER_URL, AVATAR_COMPRESSION] as const,
  );
  expect(result).toEqual({ ok: true, type: AVATAR_COMPRESSION.outputType, side: AVATAR_COMPRESSION.maxDimension });
});

test("el Shared Worker comparte el estado de la IA entre dos pestañas", async ({ context }) => {
  const [first, second] = [await context.newPage(), await context.newPage()];
  await Promise.all([first.goto("/"), second.goto("/")]);
  test.skip(!(await first.evaluate(() => "SharedWorker" in window)), "Sin Shared Worker la app usa BroadcastChannel");

  const connect = `
    window.aiState = null;
    window.aiPort = new SharedWorker(${JSON.stringify(AI_STATUS_WORKER_URL)}).port;
    window.aiPort.onmessage = ({ data }) => { if (data.type === "state") window.aiState = data.state; };
    window.aiPort.start();
  `;
  await first.evaluate(connect);
  await second.evaluate(connect);
  await expect.poll(() => second.evaluate(() => (window as unknown as { aiState: unknown }).aiState)).not.toBeNull();

  await first.evaluate(() => {
    const scope = window as unknown as { aiPort: MessagePort; aiState: { version: number } };
    scope.aiPort.postMessage({ type: "claim", version: scope.aiState.version });
  });
  await expect.poll(() => second.evaluate(() => (window as unknown as { aiState: { status: string } }).aiState.status)).toBe("waking");
});

test("el Service Worker muestra la página offline cuando no hay red", async ({ page, context, browserName }) => {
  test.skip(browserName === "firefox", "En Firefox, Playwright no corta la red de los fetch del Service Worker");
  await page.goto("/");
  // Lo registro después de la carga y precachea la página offline al instalarse: espero a que controle la página
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null), { timeout: 15_000 }).toBe(true);

  await context.setOffline(true);
  await page.goto("/login").catch(() => undefined);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(es.offline.title);
  await context.setOffline(false);
});
