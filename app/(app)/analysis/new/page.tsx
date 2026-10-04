import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { CaptureFlow } from "@/components/CaptureFlow";
import { Icon } from "@/components/ui/Icon";
import { analysesListHref, SECTION_ROLES } from "@/lib/access";
import { getMyAthleteProfile } from "@/lib/data/athletes";
import { listMyAthletes } from "@/lib/data/coach";
import { getVideoConsentVersion, getVideoLimits } from "@/lib/data/public";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { ATHLETE_PARAM, coachAthletePath, newAnalysisPath, ROUTES, withNext } from "@/lib/routes";
import type { AthleteProfile, User } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.capture.metaTitle };
}

/** El deportista sube para sí mismo; el coach, sólo para sus deportistas gestionados (`?athlete=`). */
async function uploadTarget(user: User, athleteParam: string | string[] | undefined): Promise<AthleteProfile | null> {
  if (user.role === "athlete") return getMyAthleteProfile();
  const athleteId = Number(athleteParam);
  return (await listMyAthletes()).find((athlete) => athlete.id === athleteId && athlete.is_managed) ?? null;
}

// SSR de la decisión (a quién se sube, consentimiento, límites) + isla CSR con la subida
export default async function NewAnalysisPage({ searchParams }: PageProps<"/analysis/new">) {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.analysis);
  const athlete = await uploadTarget(user, (await searchParams)[ATHLETE_PARAM]);
  if (!athlete) notFound();

  const [consentVersion, limits] = await Promise.all([getVideoConsentVersion(), getVideoLimits()]);
  if (user.video_consent_version !== consentVersion) {
    redirect(withNext(ROUTES.videoConsent, newAnalysisPath(user.role === "coach" ? athlete.id : undefined)));
  }
  const backHref = user.role === "coach" ? coachAthletePath(athlete.id) : analysesListHref(user.role);

  return (
    <div className={styles.page}>
      <Link href={backHref} className={styles.backLink}>
        <Icon name="chevronRight" size={16} />
        {t.common.back}
      </Link>
      <PageHeader
        title={t.capture.title}
        subtitle={user.role === "coach" ? format(t.capture.forAthlete, { name: athlete.display_name }) : t.capture.subtitle}
      />
      <CaptureFlow athleteId={athlete.id} maxBytes={limits.max_size_bytes} />
    </div>
  );
}
