import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ManagedAthleteForm } from "@/components/coach/ManagedAthleteForm";
import { Icon } from "@/components/ui/Icon";
import { SECTION_ROLES } from "@/lib/access";
import { createManagedAthlete } from "@/lib/actions/managed-athletes";
import { todayInAppTimeZone } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";
import { isoDate } from "@/lib/validation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.coach.newAthleteTitle };
}

export default async function NewManagedAthletePage() {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  return (
    <div className={styles.page}>
      <Link href={ROUTES.coachAthletes} className={styles.backLink}>
        <Icon name="chevronRight" size={16} />
        {t.coach.backToTeam}
      </Link>
      <PageHeader title={t.coach.newAthleteTitle} subtitle={t.coach.newAthleteSubtitle} />
      <section className={`${styles.card} ${styles.narrow}`}>
        <ManagedAthleteForm
          action={createManagedAthlete}
          today={isoDate(todayInAppTimeZone())}
          submitLabel={t.coach.createAthlete}
          pendingLabel={t.coach.creatingAthlete}
        />
      </section>
    </div>
  );
}
