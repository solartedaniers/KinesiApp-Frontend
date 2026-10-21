import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AnalysisPoller } from "@/components/AnalysisPoller";
import { AnalysisVideoPanel } from "@/components/analysis/AnalysisVideoPanel";
import { ResultGauges } from "@/components/analysis/ResultGauges";
import { AnalysisChatCard } from "@/components/chat/AnalysisChatCard";
import { ButtonLink } from "@/components/instrument/Button";
import { ConfirmDialog } from "@/components/instrument/Dialog";
import { Glyph } from "@/components/instrument/Glyph";
import { ErrorState, LoadingState } from "@/components/instrument/States";
import { analysesListHref, SECTION_ROLES } from "@/lib/access";
import { deleteAnalysis } from "@/lib/actions/analyses";
import { getAnalysis } from "@/lib/data/analyses";
import { listMyAthletes } from "@/lib/data/coach";
import { cssVars } from "@/lib/design/css";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { parseId, reportPath } from "@/lib/routes";

// Las Server Actions de esta página sostienen los streams de WatchAnalysis y del chat (hasta
// GRPC_STREAM_TIMEOUT_MS): les doy el máximo de Vercel para que la función no los corte antes
export const maxDuration = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.analysisDetail.metaTitle };
}

/**
 * SSR con streaming más islas de cliente: el servidor renderiza los medidores; si el análisis sigue
 * en proceso, AnalysisPoller escucha WatchAnalysis y pide otro render al terminar. El video y el chat
 * van cada uno en su Suspense: la URL firmada y el hilo no retrasan el resto.
 */
export default async function AnalysisPage({ params }: PageProps<"/analyses/[id]">) {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const d = t.analysisDetail;
  const user = await requireRole(SECTION_ROLES.analysis);
  const analysisId = parseId((await params).id);
  if (!analysisId) notFound();
  const analysis = await getAnalysis(analysisId);
  // El coach ve grabaciones de varios deportistas: el encabezado dice de quién es
  const coachAthlete = user.role === "coach" ? (await listMyAthletes()).find((athlete) => athlete.id === analysis.athlete_id) : undefined;
  // Borra el dueño; el coach sólo las de sus deportistas gestionados (las de uno con cuenta son suyas)
  const canDelete = user.role === "athlete" || coachAthlete?.is_managed === true;
  const processed = analysis.status === "processed";

  return (
    <>
      <Link href={analysesListHref(user.role)} className="inline-flex w-fit items-center gap-1 text-sm font-semibold">
        <Glyph name="chevronLeft" size={16} />
        {d.back}
      </Link>
      <section aria-labelledby="analysis-title" className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          {coachAthlete && <p className="text-sm font-semibold text-ink-muted">{coachAthlete.display_name}</p>}
          <h1 id="analysis-title" className="font-display text-3xl font-bold tracking-tight text-ink sm:text-hero">
            {format(d.title, { movement: t.analysis.movement[analysis.movement_type], date: f.shortDate(analysis.recorded_at) })}
          </h1>
          <p className="text-sm text-ink-muted">{f.dateTime(analysis.recorded_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {processed && <ButtonLink href="#chat" glyph="chat">{d.chat}</ButtonLink>}
          {processed && <ButtonLink href={reportPath(analysis.id)} variant="secondary" glyph="download">{t.report.download}</ButtonLink>}
          {canDelete && (
            <ConfirmDialog
              labels={{ open: t.common.delete, title: d.deleteTitle, body: d.deleteBody, confirm: t.common.delete, cancel: t.common.cancel }}
              action={deleteAnalysis.bind(null, analysis.id)}
            />
          )}
        </div>
      </section>

      {analysis.status === "pending" && <AnalysisPoller analysisId={analysis.id} />}
      {analysis.status === "failed" && <ErrorState title={d.failedTitle} body={d.failedBody} />}

      {processed && (
        <>
          <ResultGauges analysis={analysis} />
          <section aria-labelledby="analysis-timeline" className="kin-card grid gap-5 p-5 sm:p-6" style={cssVars({ "--tint": "var(--kin-center)" })}>
            <div className="grid gap-1">
              <h2 id="analysis-timeline" className="font-display text-xl font-semibold text-ink">{d.timelineTitle}</h2>
              <p className="text-sm text-ink-muted">{d.timelineLead}</p>
            </div>
            <Suspense fallback={<LoadingState label={d.preparing} />}>
              <AnalysisVideoPanel analysis={analysis} />
            </Suspense>
            {analysis.knee_target && <p className="text-sm text-ink-muted">{t.analysis.rangesNote}</p>}
          </section>
          <section id="chat" aria-labelledby="analysis-chat" className="grid scroll-mt-24 gap-3">
            <h2 id="analysis-chat" className="font-display text-xl font-semibold text-ink">{t.chat.title}</h2>
            <Suspense fallback={<LoadingState label={t.chat.preparing} />}>
              <AnalysisChatCard analysisId={analysis.id} />
            </Suspense>
          </section>
        </>
      )}

      <p className="text-sm text-ink-muted">{t.app.disclaimer}</p>
    </>
  );
}
