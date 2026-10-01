import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ChartSkeleton, ListSkeleton, TilesSkeleton } from "@/components/app/Skeleton";
import { AthleteProfileCard } from "@/components/coach/AthleteProfileCard";
import { CoachAthleteRecordings } from "@/components/coach/CoachData";
import { Icon } from "@/components/ui/Icon";
import { HOME_BY_ROLE, SECTION_ROLES } from "@/lib/access";
import { getMyAthlete } from "@/lib/data/coach";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.coach.athleteMetaTitle };

// SSR streaming (§3): la ficha sale primero (viene de la lista del coach, ya autorizada);
// cifras, evolución y grabaciones llegan después en el mismo stream
export default async function CoachAthletePage({ params }: PageProps<"/coach/athletes/[id]">) {
  await requireRole(SECTION_ROLES.coach);
  const athleteId = Number((await params).id);
  if (!Number.isInteger(athleteId) || athleteId <= 0) notFound();
  const athlete = await getMyAthlete(athleteId);

  return (
    <div className={styles.page}>
      <Link href={HOME_BY_ROLE.coach} className={styles.backLink}>
        <Icon name="chevronRight" size={16} />
        {t.coach.backToTeam}
      </Link>
      <PageHeader title={athlete.display_name} />
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
