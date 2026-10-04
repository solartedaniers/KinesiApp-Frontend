import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ChartSkeleton, ListSkeleton, TilesSkeleton } from "@/components/app/Skeleton";
import { AthleteProfileCard } from "@/components/coach/AthleteProfileCard";
import { CoachAthleteRecordings } from "@/components/coach/CoachData";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SECTION_ROLES } from "@/lib/access";
import { deleteManagedAthlete } from "@/lib/actions/managed-athletes";
import { getMyAthlete } from "@/lib/data/coach";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { coachAthleteEditPath, newAnalysisPath, ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.coach.athleteMetaTitle };
}

// SSR streaming (§3): la ficha sale primero (viene de la lista del coach, ya autorizada);
// cifras, evolución y grabaciones llegan después en el mismo stream
export default async function CoachAthletePage({ params }: PageProps<"/coach/athletes/[id]">) {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  const athleteId = Number((await params).id);
  if (!Number.isInteger(athleteId) || athleteId <= 0) notFound();
  const athlete = await getMyAthlete(athleteId);

  return (
    <div className={styles.page}>
      <Link href={ROUTES.coachAthletes} className={styles.backLink}>
        <Icon name="chevronRight" size={16} />
        {t.coach.backToTeam}
      </Link>
      <PageHeader title={athlete.display_name} />
      {/* El coach sólo gestiona (sube, edita, borra) a los deportistas sin cuenta propia */}
      {athlete.is_managed && (
        <div className={styles.actions}>
          <ButtonLink href={newAnalysisPath(athlete.id)}>
            <Icon name="upload" size={18} />
            {t.coach.uploadVideo}
          </ButtonLink>
          <ButtonLink href={coachAthleteEditPath(athlete.id)} variant="secondary">
            <Icon name="edit" size={18} />
            {t.coach.editAthlete}
          </ButtonLink>
          <ConfirmDialog
            triggerLabel={t.coach.deleteAthlete}
            title={format(t.coach.deleteAthleteTitle, { name: athlete.display_name })}
            body={t.coach.deleteAthleteBody}
            confirmLabel={t.common.delete}
            action={deleteManagedAthlete.bind(null, athlete.id)}
          />
        </div>
      )}
      <AthleteProfileCard athlete={athlete} />
      <Suspense
        fallback={
          <>
            <TilesSkeleton />
            <ChartSkeleton />
            <ListSkeleton />
          </>
        }
      >
        <CoachAthleteRecordings athleteId={athlete.id} />
      </Suspense>
    </div>
  );
}
