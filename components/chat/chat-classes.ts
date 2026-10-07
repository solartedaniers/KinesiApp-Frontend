// Clases del chat con el asistente (antes ChatPanel.module.css), compartidas con su esqueleto de carga
const MESSAGE = "max-w-[min(88%,40rem)] whitespace-pre-wrap [overflow-wrap:anywhere]";

export const chatStyles = {
  panel: "grid max-w-3xl gap-4 rounded-panel border border-line bg-panel p-4 sm:p-5",
  thread: "m-0 grid list-none gap-4 p-0",
  // Respuesta: texto corrido con la marca del asistente, sin burbuja
  assistant: `${MESSAGE} justify-self-start border-l-2 border-accent pl-4`,
  author: "mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink",
  // Pregunta del usuario: a la derecha, en un tono neutro (el acento queda para las acciones)
  user: `${MESSAGE} justify-self-end rounded-panel rounded-br-tag bg-sunken px-4 py-2.5`,
  typing: `${MESSAGE} justify-self-start pl-4 text-ink-muted italic`,
  empty: "text-ink-muted",
  form: "grid gap-2 border-t border-line pt-4",
  composer:
    "flex flex-col gap-2 rounded-control border border-line-strong bg-panel p-2 transition-colors duration-fast focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20 sm:flex-row sm:items-end",
  input: "min-h-20 w-full flex-1 resize-y bg-transparent px-2 py-1.5 placeholder:text-ink-muted focus:outline-none",
  send: "sm:self-end",
  error: "text-sm font-medium text-ink",
  disclaimer: "text-xs text-ink-muted",
} as const;
