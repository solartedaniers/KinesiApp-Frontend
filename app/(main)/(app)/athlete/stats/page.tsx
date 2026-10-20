import type { Metadata } from "next";
import { Suspense } from "react";

import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { ChartSkeleton, TilesSkeleton } from "@/components/app/Skeleton";
import { AthleteStats } from "@/components/athlete/AthleteData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.stats };
}

// SSR streaming (§3): cifras y gráfico se calculan en el servidor sobre la lista
export default async function Page() {
  const t = await getT();
  await requireRole(SECTION_ROLES.athlete);
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
        <AthleteStats />
      </Suspense>
    </div>
  );
}
