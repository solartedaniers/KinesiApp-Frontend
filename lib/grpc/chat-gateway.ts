import "server-only";

import { type Client, createClient } from "@connectrpc/connect";

import { ChatService } from "@/lib/gen/kinesiapp/chat/v1/chat_pb";

import type { ChatEvent } from "../analysis-events";
import type { ChatMessage } from "../types";
import { grpcEnv } from "./env";
import { toChatMessage } from "./mappers";
import { authedTransport } from "./transport";

/** Adaptador de kinesiapp.chat.v1.ChatService: el texto llega por fragmentos mientras el modelo lo genera. */
export class ChatGateway {
  constructor(
    private readonly client: Client<typeof ChatService>,
    private readonly streamTimeoutMs: number,
  ) {}

  async messages(analysisId: string): Promise<ChatMessage[]> {
    return (await this.client.listMessages({ analysisId })).messages.map(toChatMessage);
  }

  /** Idempotente: si ya existe, el backend emite la explicación guardada en un solo mensaje. */
  async *start(analysisId: string, signal?: AbortSignal): AsyncGenerator<ChatEvent> {
    for await (const response of this.client.startConversation({ analysisId }, { timeoutMs: this.streamTimeoutMs, signal })) {
      if (response.event.case === "textDelta") yield { kind: "delta", text: response.event.value };
      if (response.event.case === "assistantMessage") yield { kind: "assistant", message: toChatMessage(response.event.value) };
    }
  }

  async *send(analysisId: string, content: string, signal?: AbortSignal): AsyncGenerator<ChatEvent> {
    for await (const response of this.client.sendMessage({ analysisId, content }, { timeoutMs: this.streamTimeoutMs, signal })) {
      if (response.event.case === "userMessage") yield { kind: "user", message: toChatMessage(response.event.value) };
      if (response.event.case === "textDelta") yield { kind: "delta", text: response.event.value };
      if (response.event.case === "assistantMessage") yield { kind: "assistant", message: toChatMessage(response.event.value) };
    }
  }
}

export function chatGateway(): ChatGateway {
  return new ChatGateway(createClient(ChatService, authedTransport()), grpcEnv().GRPC_STREAM_TIMEOUT_MS);
}
