"use client";

import { useActionState, useOptimistic } from "react";

import { LogoMark } from "@/components/brand/LogoMark";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import type { ChatField } from "@/lib/actions/chat";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";
import type { ChatMessage } from "@/lib/types";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/lib/validation";

import { chatStyles as styles } from "./chat-classes";

type ChatAction = (previous: FormState<ChatField>, formData: FormData) => Promise<FormState<ChatField>>;

// id negativo: mensaje todavía no confirmado por el backend
const PENDING_ID = -1;

/** Hilo del usuario con el asistente. El mensaje enviado aparece de inmediato mientras responde. */
export function ChatPanel({ messages, action }: { messages: ChatMessage[]; action: ChatAction }) {
  const t = useT();
  const [optimisticMessages, addPending] = useOptimistic(messages, (current, content: string) => [
    ...current,
    { id: PENDING_ID, role: "user" as const, content, created_at: "" },
  ]);
  const [state, formAction, pending] = useActionState(async (previous: FormState<ChatField>, formData: FormData) => {
    addPending(String(formData.get("content") ?? "").trim());
    return action(previous, formData);
  }, {});

  return (
    <div className={styles.panel}>
      {optimisticMessages.length === 0 ? (
        <p className={styles.empty}>{t.chat.empty}</p>
      ) : (
        <ol className={styles.thread} aria-live="polite">
          {optimisticMessages.map((message, index) => (
            <li key={message.id === PENDING_ID ? `pending-${index}` : message.id} className={styles[message.role]}>
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
          {pending && <li className={styles.typing}>{t.chat.thinking}</li>}
        </ol>
      )}

      <form action={formAction} className={styles.form} noValidate>
        {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
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
            defaultValue={state.values?.content}
            aria-invalid={state.fieldErrors?.content ? true : undefined}
            required
          />
          <Button type="submit" pending={pending} pendingLabel={t.chat.sending} className={styles.send}>
            {t.chat.send}
          </Button>
        </div>
        {state.fieldErrors?.content && <p className={styles.error}>{state.fieldErrors.content}</p>}
      </form>
      <p className={styles.disclaimer}>{t.chat.disclaimer}</p>
    </div>
  );
}
