// Informe en PDF. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { openingExplanation } from "./report.ts";
import type { ChatMessage } from "./types.ts";

const message = (id: number, role: ChatMessage["role"], content: string): ChatMessage => ({ id, role, content, created_at: "2026-10-05T10:00:00Z" });

test("el informe lleva la explicación inicial de la IA, no las preguntas posteriores", () => {
  const thread = [message(1, "assistant", "Explicación inicial"), message(2, "user", "¿Y el tronco?"), message(3, "assistant", "Respuesta")];
  assert.equal(openingExplanation(thread), "Explicación inicial");
  assert.equal(openingExplanation([]), null);
});
