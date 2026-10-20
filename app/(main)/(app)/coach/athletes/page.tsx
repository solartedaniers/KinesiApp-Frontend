import type { Metadata } from "next";
import { Suspense } from "react";

import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { CoachAthletesList } from "@/components/coach/CoachData";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.athletes };
}

export default async function CoachAthletesPage() {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <PageHeader title={t.nav.athletes} />
        <ButtonLink href={ROUTES.newCoachAthlete}>
          <Icon name="plus" size={18} />
          {t.coach.newAthlete}
        </ButtonLink>
      </div>
      <Suspense fallback={<ListSkeleton />}>
        <CoachAthletesList />
      </Suspense>
    </div>
  );
}
