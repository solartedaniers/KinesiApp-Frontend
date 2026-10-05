import { FormAlert } from "@/components/ui/FormAlert";
import { sendChatMessage } from "@/lib/actions/chat";
import { openChat } from "@/lib/data/analyses";
import { codeMessage } from "@/lib/errors";
import { getT } from "@/lib/i18n/server";

import { ChatPanel } from "./ChatPanel";

/**
 * Chat del análisis ya abierto en la ficha del resultado, con la explicación inicial de la IA. La
 * página lo envuelve en <Suspense>: el resultado y las gráficas salen primero y la explicación llega
 * en otro chunk del mismo stream, sin que el usuario tenga que pedirla.
 */
export async function AnalysisChatCard({ analysisId }: { analysisId: number }) {
  const [t, { messages, errorCode }] = await Promise.all([getT(), openChat(analysisId)]);
  return (
    <>
      {errorCode && <FormAlert tone="info">{codeMessage(t, errorCode)}</FormAlert>}
      <ChatPanel messages={messages} action={sendChatMessage.bind(null, analysisId)} />
    </>
  );
}
