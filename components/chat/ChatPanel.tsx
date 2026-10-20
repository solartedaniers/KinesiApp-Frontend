"use client";

import { useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/brand/LogoMark";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { sendChatMessage, startConversation } from "@/lib/actions/chat";
import type { ChatEvent } from "@/lib/analysis-events";
import { codeMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/client";
import { createTextBatcher } from "@/lib/text-stream";
import type { ChatMessage } from "@/lib/types";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/lib/validation";

import { chatStyles as styles } from "./chat-classes";

/**
 * Hilo del usuario con el asistente. Las respuestas llegan por fragmentos (StartConversation y
 * SendMessage en streaming) y se van escribiendo mientras el modelo las genera.
 */
export function ChatPanel({ analysisId, messages: initial }: { analysisId: string; messages: ChatMessage[] }) {
  const t = useT();
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const opened = useRef(false);

  async function consume(events: AsyncIterable<ChatEvent>) {
    const batcher = createTextBatcher((text) => setDraft((current) => (current ?? "") + text));
    setDraft("");
    try {
      for await (const event of events) {
        if (event.kind === "user") setMessages((current) => [...current, event.message]);
        if (event.kind === "delta") batcher.push(event.text);
        if (event.kind === "assistant") setMessages((current) => [...current, event.message]);
        if (event.kind === "failed") setError(codeMessage(t, event.reason));
      }
    } catch {
      setError(t.errors.network);
    } finally {
      setDraft(null);
    }
  }

  // La primera vez que se abre un análisis procesado, la explicación se pide sola
  useEffect(() => {
    if (opened.current || initial.length > 0) return;
    opened.current = true;
    void startConversation(analysisId).then(consume);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  async function send() {
    setError(null);
    const result = await sendChatMessage(analysisId, content);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setContent("");
    await consume(result.events);
  }

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
                  <LogoMark size={18} />
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

      <form action={send} className={styles.form} noValidate>
        {error && <FormAlert tone="error">{error}</FormAlert>}
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
          <Button type="submit" pending={busy} pendingLabel={t.chat.sending} className={styles.send}>
            {t.chat.send}
          </Button>
        </div>
      </form>
      <p className={styles.disclaimer}>{t.chat.disclaimer}</p>
    </div>
  );
}
