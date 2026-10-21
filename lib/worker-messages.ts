// Esquemas de lo que llega de los workers y de las otras pestañas. Los parseo aunque los scripts sean
// propios: un mensaje que no cumple se descarta en vez de colarse como si fuera del tipo esperado.
import { z } from "zod";

import type { AiStatusState, FromCoordinator } from "./ai-status/protocol.ts";

const aiStatusState: z.ZodType<AiStatusState> = z.object({
  status: z.enum(["idle", "waking", "ready", "unavailable"]),
  at: z.number().nonnegative(),
  version: z.number().int().nonnegative(),
});

/** Shared Worker → pestaña. */
export const fromCoordinatorSchema: z.ZodType<FromCoordinator> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("state"), state: aiStatusState }),
  z.object({ type: z.literal("perform") }),
]);

export type BroadcastMessage = { type: "state"; state: AiStatusState } | { type: "query" };

/** Pestaña → pestañas, por BroadcastChannel (el respaldo sin Shared Worker). */
export const broadcastSchema: z.ZodType<BroadcastMessage> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("state"), state: aiStatusState }),
  z.object({ type: z.literal("query") }),
]);

export type VideoReading = { durationMs: number | null; width: number; height: number; container: string } | null;

/** Lectura del video-metadata-worker; null cuando no entendió el archivo. */
export const videoReadingSchema: z.ZodType<VideoReading> = z
  .object({
    durationMs: z.number().nonnegative().nullable(),
    width: z.number().int().nonnegative(),
    height: z.number().int().nonnegative(),
    container: z.string(),
  })
  .nullable();

export type AvatarReply = { ok: true; blob: Blob } | { ok: false; tooLarge: boolean };

export const avatarReplySchema: z.ZodType<AvatarReply> = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), blob: z.instanceof(Blob) }),
  z.object({ ok: z.literal(false), tooLarge: z.boolean() }),
]);

/** Bytes del PDF del report-worker; null si no pudo dibujarlo. */
export const reportReplySchema = z.instanceof(Uint8Array).nullable();
