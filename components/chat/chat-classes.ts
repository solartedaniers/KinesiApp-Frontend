// Clases del chat con el asistente, compartidas con su esqueleto de carga
const MESSAGE = "max-w-[min(92%,44rem)] whitespace-pre-wrap [overflow-wrap:anywhere]";

export const chatStyles = {
  panel: "kin-card kin-tinted grid gap-5 p-5 sm:p-6 [--tint:var(--kin-accent)]",
  thread: "m-0 grid list-none gap-4 p-0",
  // Respuesta: un pozo con la marca del asistente
  assistant: `${MESSAGE} kin-well justify-self-start p-4 text-ink`,
  author: "mb-2 flex items-center gap-2 text-sm font-semibold text-accent",
  // Pregunta del usuario: a la derecha, en el tono suave de la acción
  user: `${MESSAGE} justify-self-end rounded-panel rounded-br-md bg-accent-soft px-4 py-2.5 text-ink`,
  typing: `${MESSAGE} kin-well justify-self-start p-4 text-ink-muted`,
  empty: "text-ink-muted",
  form: "grid gap-2 border-t border-line pt-4",
  composer: "kin-field flex flex-col gap-2 p-2 sm:flex-row sm:items-end",
  input: "min-h-20 w-full flex-1 resize-y bg-transparent px-2 py-1.5 text-ink outline-none placeholder:text-ink-muted",
  send: "sm:self-end",
  disclaimer: "text-xs text-ink-muted",
} as const;
