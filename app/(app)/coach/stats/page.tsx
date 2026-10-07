import type { Metadata } from "next";
import { Suspense } from "react";

import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { ChartSkeleton, TilesSkeleton } from "@/components/app/Skeleton";
import { TeamStats } from "@/components/coach/CoachData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { TEAM_PARAM } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.stats };
}

// SSR streaming (§3): cifras y riesgo por deportista, de todos o de un equipo (?team=), y por equipo
export default async function Page({ searchParams }: PageProps<"/coach/stats">) {
  const t = await getT();
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
        <TeamStats teamParam={(await searchParams)[TEAM_PARAM]} />
      </Suspense>
    </div>
  );
}
