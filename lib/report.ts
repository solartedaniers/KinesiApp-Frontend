// Contenido del informe en PDF: lógica pura (testeada en report.test.ts).
import type { ChatMessage } from "./types.ts";

/**
 * Explicación de la IA que va en el informe: la primera respuesta del asistente en el hilo, que es la
 * explicación inicial del resultado (las preguntas posteriores del usuario no van al informe).
 */
export function openingExplanation(messages: ChatMessage[]): string | null {
  return messages.find((message) => message.role === "assistant")?.content ?? null;
}
