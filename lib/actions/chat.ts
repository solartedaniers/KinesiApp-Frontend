"use server";

import type { ChatEvent } from "../analysis-events";
import { chatGateway } from "../grpc/chat-gateway";
import { rpcReason } from "../grpc/errors";
import { getT } from "../i18n/server";
import { validationMessage } from "../errors";
import { validateChatMessage } from "../validation";

async function* guarded(events: () => AsyncIterable<ChatEvent>): AsyncGenerator<ChatEvent> {
  try {
    yield* events();
  } catch (error) {
    // La pregunta ya guardada sigue en el hilo: el cliente muestra el error y deja preguntar otra vez
    yield { kind: "failed", reason: rpcReason(error) };
  }
}

/** Primera explicación del resultado, por fragmentos. Idempotente: si ya existe llega en un solo mensaje. */
export async function startConversation(analysisId: string): Promise<AsyncIterable<ChatEvent>> {
  return guarded(() => chatGateway().start(analysisId));
}

export type ChatSendResult = { events: AsyncIterable<ChatEvent> } | { error: string };

/** Una pregunta y su respuesta en streaming. Valido el texto aquí también: el navegador no es de fiar. */
export async function sendChatMessage(analysisId: string, content: string): Promise<ChatSendResult> {
  const text = content.trim();
  const invalid = validateChatMessage(text);
  if (invalid) return { error: validationMessage(await getT(), invalid) };
  return { events: guarded(() => chatGateway().send(analysisId, text)) };
}
