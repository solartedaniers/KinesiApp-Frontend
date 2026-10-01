import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ChartSkeleton, TilesSkeleton } from "@/components/app/Skeleton";
import { TeamStats } from "@/components/coach/CoachData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.stats };

// SSR streaming (§3): cifras del equipo y riesgo promedio por deportista
export default async function Page() {
  await requireRole(SECTION_ROLES.coach);
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.stats} />
      <Suspense
        fallback={
          <>
            <TilesSkeleton count={8} />
            <ChartSkeleton />
          </>
        }
      >
        <TeamStats />
      </Suspense>
    </div>
  );
}
