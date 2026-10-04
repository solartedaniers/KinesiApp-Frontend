import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { FormAlert } from "@/components/ui/FormAlert";
import { Icon } from "@/components/ui/Icon";
import { SECTION_ROLES } from "@/lib/access";
import { sendChatMessage } from "@/lib/actions/chat";
import { getAnalysis, listChatMessages } from "@/lib/data/analyses";
import { requireRole } from "@/lib/guard";
import { getFormat, getT } from "@/lib/i18n/server";
import { analysisPath } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.chat.metaTitle };
}

// SSR del hilo + isla CSR del formulario. El backend decide quién puede chatear sobre el análisis
export default async function AnalysisChatPage({ params }: PageProps<"/analysis/[id]/chat">) {
  const t = await getT();
  const fmt = await getFormat();
  await requireRole(SECTION_ROLES.analysis);
  const analysisId = Number((await params).id);
  if (!Number.isInteger(analysisId) || analysisId <= 0) notFound();
  const [analysis, messages] = await Promise.all([getAnalysis(analysisId), listChatMessages(analysisId)]);

  return (
    <div className={styles.page}>
      <Link href={analysisPath(analysis.id)} className={styles.backLink}>
        <Icon name="chevronRight" size={16} />
        {t.chat.back}
      </Link>
      <PageHeader
        title={t.chat.title}
        subtitle={`${t.analysis.movement[analysis.movement_type]} · ${fmt.dateTime(analysis.recorded_at)}`}
      />
      {analysis.status === "processed" ? (
        <ChatPanel messages={messages} action={sendChatMessage.bind(null, analysis.id)} />
      ) : (
        <FormAlert tone="info">{t.errors.analysis_not_processed}</FormAlert>
      )}
    </div>
  );
}
