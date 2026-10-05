import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalysisReport } from "@/components/report/AnalysisReport";
import { PrintButton } from "@/components/report/PrintButton";
import { Icon } from "@/components/ui/Icon";
import { SECTION_ROLES } from "@/lib/access";
import { getAnalysis, openChat } from "@/lib/data/analyses";
import { getMyAthleteProfile } from "@/lib/data/athletes";
import { listMyAthletes } from "@/lib/data/coach";
import { requireOnboarded, requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { analysisPath } from "@/lib/routes";
import type { AthleteProfile, JumpAnalysis, User } from "@/lib/types";

import styles from "./report.module.css";

/** Ficha del deportista del análisis, con los mismos permisos que ya aplica la pantalla del análisis. */
async function reportAthlete(user: User, analysis: JumpAnalysis): Promise<AthleteProfile | undefined> {
  if (user.role === "athlete") return (await getMyAthleteProfile()) ?? undefined;
  return (await listMyAthletes()).find((athlete) => athlete.id === analysis.athlete_id);
}

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return id;
}

export async function generateMetadata({ params }: PageProps<"/report/[id]">): Promise<Metadata> {
  // El título de la pestaña es el nombre que propone el navegador al guardar el PDF
  const [t, fmt] = await Promise.all([getT(), getFormat()]);
  const analysis = await getAnalysis(parseId((await params).id));
  return { title: format(t.report.fileTitle, { date: fmt.shortDate(analysis.recorded_at) }) };
}

// Informe imprimible fuera del marco de la app: sin barra lateral ni controles, listo para "Guardar
// como PDF". Mismos roles que la sección de análisis (deportista y entrenador)
export default async function AnalysisReportPage({ params }: PageProps<"/report/[id]">) {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.analysis);
  await requireOnboarded(user);
  const analysis = await getAnalysis(parseId((await params).id));
  // Sólo análisis terminados: un informe sin resultado no tiene sentido
  if (analysis.status !== "processed") notFound();
  const athlete = await reportAthlete(user, analysis);
  if (!athlete || athlete.id !== analysis.athlete_id) notFound();
  const opening = await openChat(analysis.id);

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        <Link href={analysisPath(analysis.id)} className={styles.back}>
          <Icon name="chevronRight" size={16} />
          {t.report.back}
        </Link>
        <PrintButton />
      </div>
      <p className={styles.hint}>{t.report.printHint}</p>
      <AnalysisReport analysis={analysis} athlete={athlete} opening={opening} />
    </main>
  );
}
