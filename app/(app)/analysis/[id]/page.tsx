import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AnalysisPoller } from "@/components/AnalysisPoller";
import styles from "@/components/analysis/AnalysisDetail.module.css";
import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { AnalysisVideoPanel } from "@/components/analysis/AnalysisVideoPanel";
import { AngleCharts } from "@/components/analysis/AngleCharts";
import pageStyles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { Section } from "@/components/app/Section";
import { ChartSkeleton } from "@/components/app/Skeleton";
import { FormAlert } from "@/components/ui/FormAlert";
import { Icon } from "@/components/ui/Icon";
import { analysesListHref, SECTION_ROLES } from "@/lib/access";
import { getAnalysis } from "@/lib/data/analyses";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.analysisDetail.metaTitle };

/**
 * SSR + isla CSR de polling (§3): el servidor renderiza el estado actual; si está en proceso,
 * AnalysisPoller consulta hasta que cambie y pide un nuevo render. El video va en su propio
 * Suspense: la URL firmada no retrasa el resto de la página.
 */
export default async function AnalysisPage({ params }: PageProps<"/analysis/[id]">) {
  const user = await requireRole(SECTION_ROLES.analysis);
  const analysisId = Number((await params).id);
  if (!Number.isInteger(analysisId) || analysisId <= 0) notFound();
  const analysis = await getAnalysis(analysisId);

  return (
    <div className={pageStyles.page}>
      <Link href={analysesListHref(user.role)} className={styles.back}>
        <Icon name="chevronRight" size={16} />
        {t.analysisDetail.back}
      </Link>
      <PageHeader title={t.analysis.movement[analysis.movement_type]} subtitle={formatDateTime(analysis.recorded_at)} />

      {analysis.status === "pending" && <AnalysisPoller analysisId={analysis.id} />}
      {analysis.status === "failed" && (
        <FormAlert tone="error">
          <strong>{t.analysisDetail.failedTitle}</strong>
          <p>{t.analysisDetail.failedBody}</p>
        </FormAlert>
      )}

      <div className={styles.columns}>
        <Section title={t.analysisDetail.video}>
          <Suspense fallback={<ChartSkeleton />}>
            <AnalysisVideoPanel analysisId={analysis.id} />
          </Suspense>
        </Section>
        <AnalysisResult analysis={analysis} />
      </div>

      {analysis.status === "processed" && (
        <Section title={t.analysisDetail.angles}>
          <AngleCharts measurements={analysis.angle_measurements} />
        </Section>
      )}

      <p className={styles.disclaimer}>{t.app.disclaimer}</p>
    </div>
  );
}
