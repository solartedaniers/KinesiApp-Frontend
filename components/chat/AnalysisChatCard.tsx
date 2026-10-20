import { listChatMessages } from "@/lib/data/analyses";

import { ChatPanel } from "./ChatPanel";

/**
 * Chat del análisis en la ficha del resultado. La página lo envuelve en <Suspense>: el resultado y las
 * gráficas salen primero y el hilo llega en otro chunk del mismo stream. Si todavía no hay explicación,
 * ChatPanel la pide con StartConversation y la muestra mientras se genera.
 */
export async function AnalysisChatCard({ analysisId }: { analysisId: string }) {
  return <ChatPanel analysisId={analysisId} messages={await listChatMessages(analysisId)} />;
}
