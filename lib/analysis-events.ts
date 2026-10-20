// Eventos que cruzan del servidor de Next al navegador dentro de los streams de las Server Actions.
import type { AnalysisProgress, AnalysisSummary, ChatMessage } from "./types";

export type AnalysisEvent =
  | { kind: "progress"; progress: AnalysisProgress }
  | { kind: "finished"; analysis: AnalysisSummary }
  /** El stream se cortó; el cliente puede volver a suscribirse. `reason` es la clave de errors en i18n. */
  | { kind: "failed"; reason: string };

export type ChatEvent =
  | { kind: "user"; message: ChatMessage }
  | { kind: "delta"; text: string }
  | { kind: "assistant"; message: ChatMessage }
  | { kind: "failed"; reason: string };
