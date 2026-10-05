import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { AngleCharts } from "@/components/analysis/AngleCharts";
import type { ChatOpening } from "@/lib/data/analyses";
import { codeMessage } from "@/lib/errors";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { openingExplanation } from "@/lib/report";
import type { AthleteProfile, JumpAnalysis } from "@/lib/types";

import styles from "./AnalysisReport.module.css";

/**
 * Contenido del informe en el orden pedido: entrenador responsable, deportista, gráficas, tabla de
 * datos y explicación de la IA, con el descargo de responsabilidad visible. Sólo presenta datos que
 * la página ya obtuvo con los permisos del usuario.
 */
export async function AnalysisReport({
  analysis,
  athlete,
  opening,
}: {
  analysis: JumpAnalysis;
  athlete: AthleteProfile;
  opening: ChatOpening;
}) {
  const [t, fmt] = await Promise.all([getT(), getFormat()]);
  const explanation = openingExplanation(opening.messages);

  return (
    <article className={styles.report}>
      <header className={styles.header}>
        <p className={styles.brand}>{t.app.name}</p>
        <h1 className={styles.title}>{t.report.title}</h1>
        <p className={styles.meta}>
          {format(t.report.subtitle, {
            movement: t.analysis.movement[analysis.movement_type],
            date: fmt.dateTime(analysis.recorded_at),
          })}
        </p>
      </header>

      <dl className={styles.people}>
        <div>
          <dt>{t.report.coach}</dt>
          <dd>{athlete.coach_name ?? t.report.noCoach}</dd>
        </div>
        <div>
          <dt>{t.report.athlete}</dt>
          <dd>{athlete.display_name}</dd>
        </div>
      </dl>

      <section className={styles.section}>
        <AnalysisResult analysis={analysis} />
      </section>

      <section className={styles.section} aria-labelledby="report-charts">
        <h2 id="report-charts" className={styles.sectionTitle}>
          {t.report.charts}
        </h2>
        {/* Gráficas y, debajo de cada una, su tabla completa de datos */}
        <AngleCharts measurements={analysis.angle_measurements} tablesOpen />
      </section>

      <section className={styles.section} aria-labelledby="report-explanation">
        <h2 id="report-explanation" className={styles.sectionTitle}>
          {t.report.explanation}
        </h2>
        {explanation ? (
          <p className={styles.explanation}>{explanation}</p>
        ) : (
          <p className={styles.note}>{opening.errorCode ? codeMessage(t, opening.errorCode) : t.report.noExplanation}</p>
        )}
      </section>

      <aside className={styles.disclaimer} role="note">
        <strong>{t.report.disclaimerTitle}</strong>
        <p>{t.report.disclaimer}</p>
      </aside>
    </article>
  );
}
