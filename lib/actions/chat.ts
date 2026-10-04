"use server";

import { refresh } from "next/cache";

import { API_PATHS } from "../api-paths";
import { errorMessage, validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { getT } from "../i18n/server";
import { validateChatMessage } from "../validation";
import { authedMutation } from "./request";

export type ChatField = "content";

/** Envía un mensaje al asistente sobre el análisis (ligada con `.bind(null, analysisId)`). */
export async function sendChatMessage(
  analysisId: number,
  _previous: FormState<ChatField>,
  formData: FormData,
): Promise<FormState<ChatField>> {
  const t = await getT();
  const content = formText(formData, "content").trim();
  const error = validateChatMessage(content);
  if (error) return { fieldErrors: validationMessages(t, { content: error }), values: { content } };

  try {
    await authedMutation(API_PATHS.chatMessages(analysisId), { method: "POST", body: { content } });
  } catch (failure) {
    // El texto se repone para no perderlo si el asistente no respondió (429, 503)
    return { error: errorMessage(t, failure), values: { content } };
  }
  refresh();
  return {};
}
