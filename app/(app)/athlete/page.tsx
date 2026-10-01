import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton, TilesSkeleton } from "@/components/app/Skeleton";
import { AthleteOverview } from "@/components/athlete/AthleteData";
import { SECTION_ROLES } from "@/lib/access";
import { firstName } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { format, t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.home };

// SSR streaming (§3): el saludo sale con el primer chunk; resumen y recientes llegan después
export default async function AthleteHomePage() {
  const user = await requireRole(SECTION_ROLES.athlete);
  return (
    <div className={styles.page}>
      <PageHeader title={format(t.home.greeting, { name: firstName(user.full_name) })} subtitle={t.home.athlete} />
      <Suspense
        fallback={
          <>
            <TilesSkeleton />
            <ListSkeleton />
          </>
        }
      >
        <AthleteOverview />
      </Suspense>
    </div>
  );
}
