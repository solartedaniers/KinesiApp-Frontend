"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/instrument/Button";
import { Glyph } from "@/components/instrument/Glyph";
import { FormAlert } from "@/components/ui/FormAlert";
import { sendChatMessage, startConversation } from "@/lib/actions/chat";
import type { ChatEvent } from "@/lib/analysis-events";
import { codeMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/client";
import { createTextBatcher } from "@/lib/text-stream";
import type { ChatMessage } from "@/lib/types";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/lib/validation";

import { chatStyles as styles } from "./chat-classes";

type Retry = { kind: "opening" } | { kind: "question"; text: string };

/** El reintento de una pregunta trae el mismo mensaje (el backend la reutiliza): no la muestro dos veces. */
const appendOnce = (message: ChatMessage) => (current: ChatMessage[]) => (current.some((m) => m.id === message.id) ? current : [...current, message]);

/**
 * Hilo del usuario con el asistente. Las respuestas llegan por fragmentos (StartConversation y
 * SendMessage en streaming) y se van escribiendo mientras el modelo las genera. Si una respuesta
 * falla, la pregunta vuelve al cuadro y el aviso ofrece reintentar.
 */
export function ChatPanel({ analysisId, messages: initial }: { analysisId: string; messages: ChatMessage[] }) {
  const t = useT();
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<Retry | null>(null);
  const [content, setContent] = useState("");
  const opened = useRef(false);

  /** Devuelve si la respuesta llegó completa. */
  async function consume(events: AsyncIterable<ChatEvent>): Promise<boolean> {
    const batcher = createTextBatcher((text) => setDraft((current) => (current ?? "") + text));
    setDraft("");
    let answered = false;
    try {
      for await (const event of events) {
        if (event.kind === "user") setMessages(appendOnce(event.message));
        if (event.kind === "delta") batcher.push(event.text);
        if (event.kind === "assistant") {
          answered = true;
          setMessages(appendOnce(event.message));
        }
        if (event.kind === "failed") setError(codeMessage(t, event.reason));
      }
    } catch {
      // El stream de la Server Action se cortó en el camino al navegador: no hay motivo del backend
      setError(t.errors.NETWORK);
    } finally {
      setDraft(null);
    }
    return answered;
  }

  async function open() {
    setError(null);
    setRetry(null);
    if (!(await consume(await startConversation(analysisId)))) setRetry({ kind: "opening" });
  }

  async function ask(question: string) {
    setError(null);
    setRetry(null);
    const result = await sendChatMessage(analysisId, question);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setContent("");
    if (await consume(result.events)) return;
    // La pregunta vuelve al cuadro, salvo que ya se haya empezado a escribir otra
    setContent((current) => current || question);
    setRetry({ kind: "question", text: question });
  }

  // La primera vez que se abre un análisis procesado, la explicación se pide sola
  useEffect(() => {
    if (opened.current || initial.length > 0) return;
    opened.current = true;
    void open();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const busy = draft !== null;

  return (
    <div className={styles.panel}>
      {messages.length === 0 && !busy ? (
        <p className={styles.empty}>{t.chat.empty}</p>
      ) : (
        <ol className={styles.thread} aria-live="polite" aria-busy={busy}>
          {messages.map((message) => (
            <li key={message.id} className={styles[message.role]}>
              {message.role === "assistant" && (
                <span className={styles.author} aria-hidden>
                  <Glyph name="ai" size={18} />
                  {t.chat.roles.assistant}
                </span>
              )}
              <span className="visually-hidden">{t.chat.roles[message.role]}: </span>
              {message.content}
            </li>
          ))}
          {busy && <li className={draft ? styles.assistant : styles.typing}>{draft || (messages.length ? t.chat.thinking : t.chat.preparing)}</li>}
        </ol>
      )}

      <form action={() => ask(content)} className={styles.form} noValidate>
        {error && (
          <FormAlert tone="error">
            <p>{error}</p>
            {retry?.kind === "question" && <p>{t.chat.keptQuestion}</p>}
            {retry && (
              <Button variant="secondary" glyph="chat" disabled={busy} className="mt-1 w-fit" onClick={() => void (retry.kind === "opening" ? open() : ask(retry.text))}>
                {retry.kind === "opening" ? t.chat.retryOpening : t.chat.retry}
              </Button>
            )}
          </FormAlert>
        )}
        <label htmlFor="chat-content" className="visually-hidden">
          {t.chat.label}
        </label>
        <div className={styles.composer}>
          <textarea
            id="chat-content"
            name="content"
            className={styles.input}
            rows={3}
            maxLength={CHAT_MESSAGE_MAX_LENGTH}
            placeholder={t.chat.placeholder}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
          <Button type="submit" glyph="chat" pending={busy} className={styles.send}>
            {t.chat.send}
          </Button>
        </div>
      </form>
      <p className={styles.disclaimer}>{t.chat.disclaimer}</p>
    </div>
  );
}
