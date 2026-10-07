import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AnalysisPoller } from "@/components/AnalysisPoller";
import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { AnalysisVideoPanel } from "@/components/analysis/AnalysisVideoPanel";
import { AngleCharts } from "@/components/analysis/AngleCharts";
import { pageStyles } from "@/components/app/page-classes";
import { Section } from "@/components/app/Section";
import { ChartSkeleton } from "@/components/app/Skeleton";
import { AnalysisChatCard } from "@/components/chat/AnalysisChatCard";
import { ChatCardSkeleton } from "@/components/chat/ChatCardSkeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ButtonLink } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Icon } from "@/components/ui/Icon";
import { analysesListHref, SECTION_ROLES } from "@/lib/access";
import { deleteAnalysis } from "@/lib/actions/analyses";
import { getAnalysis } from "@/lib/data/analyses";
import { listMyAthletes } from "@/lib/data/coach";
import { requireRole } from "@/lib/guard";
import { getFormat, getT } from "@/lib/i18n/server";
import { reportPath } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.analysisDetail.metaTitle };
}

/**
 * SSR + isla CSR de polling (§3): el servidor renderiza el estado actual; si está en proceso,
 * AnalysisPoller consulta hasta que cambie y pide un nuevo render. El video va en su propio
 * Suspense: la URL firmada no retrasa el resto de la página.
 */
export default async function AnalysisPage({ params }: PageProps<"/analyses/[id]">) {
  const t = await getT();
  const fmt = await getFormat();
  const user = await requireRole(SECTION_ROLES.analysis);
  const analysisId = Number((await params).id);
  if (!Number.isInteger(analysisId) || analysisId <= 0) notFound();
  const analysis = await getAnalysis(analysisId);
  // El coach ve grabaciones de varios deportistas: el subtítulo dice de quién es
  const coachAthlete =
    user.role === "coach" ? (await listMyAthletes()).find((athlete) => athlete.id === analysis.athlete_id) : undefined;
  const athleteName = coachAthlete?.display_name;
  // Borra el dueño; el coach sólo las de sus deportistas gestionados (las de uno con cuenta son suyas)
  const canDelete = user.role === "athlete" || coachAthlete?.is_managed === true;
  const recordedAt = fmt.dateTime(analysis.recorded_at);

  return (
    <div className={pageStyles.page}>
      <Link href={analysesListHref(user.role)} className={pageStyles.backLink}>
        <Icon name="chevronRight" size={16} />
        {t.analysisDetail.back}
      </Link>
      <div className={pageStyles.headerRow}>
        <header className={pageStyles.header}>
          <h1 className={pageStyles.title}>{t.analysis.movement[analysis.movement_type]}</h1>
          <p className="flex flex-wrap gap-x-3 text-ink-muted">
            {athleteName && <span className="font-medium text-ink">{athleteName}</span>}
            <span>{recordedAt}</span>
          </p>
        </header>
        <div className={pageStyles.actions}>
          {analysis.status === "processed" && (
            <ButtonLink href={reportPath(analysis.id)} variant="secondary">
              <Icon name="upload" size={18} />
              {t.report.export}
            </ButtonLink>
          )}
          {canDelete && (
            <ConfirmDialog
              triggerLabel={t.analysisDetail.delete}
              title={t.analysisDetail.deleteTitle}
              body={t.analysisDetail.deleteBody}
              confirmLabel={t.common.delete}
              action={deleteAnalysis.bind(null, analysis.id)}
            />
          )}
        </div>
      </div>

      {analysis.status === "pending" && <AnalysisPoller analysisId={analysis.id} />}
      {analysis.status === "failed" && (
        <FormAlert tone="error">
          <strong>{t.analysisDetail.failedTitle}</strong>
          <p>{t.analysisDetail.failedBody}</p>
        </FormAlert>
      )}

      {/* El video con la línea de tiempo es el protagonista: ocupa el ancho; el resultado va al costado */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-label={t.analysisDetail.video}>
          <Suspense fallback={<ChartSkeleton />}>
            <AnalysisVideoPanel analysis={analysis} />
          </Suspense>
        </section>
        <AnalysisResult analysis={analysis} />
      </div>

      {/* La explicación de la IA llega sola apenas el resultado está listo; se puede seguir preguntando */}
      {analysis.status === "processed" && (
        <Section title={t.chat.title}>
          <Suspense fallback={<ChatCardSkeleton />}>
            <AnalysisChatCard analysisId={analysis.id} />
          </Suspense>
        </Section>
      )}

      {analysis.status === "processed" && (
        <Section title={t.analysisDetail.angles}>
          <AngleCharts measurements={analysis.angle_measurements} />
        </Section>
      )}

      <p className="text-sm text-ink-muted">{t.app.disclaimer}</p>
    </div>
  );
}
