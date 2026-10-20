import type { Metadata } from "next";
import { Suspense } from "react";

import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton, TilesSkeleton } from "@/components/app/Skeleton";
import { CoachOverview } from "@/components/coach/CoachData";
import { SECTION_ROLES } from "@/lib/access";
import { firstName } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.home };
}

// SSR streaming (§3): saludo inmediato; resumen del equipo y deportistas en un chunk posterior
export default async function CoachHomePage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.coach);
  return (
    <div className={styles.page}>
      <PageHeader title={format(t.home.greeting, { name: firstName(user.full_name) })} subtitle={t.home.coach} />
      <Suspense
        fallback={
          <>
            <TilesSkeleton />
            <ListSkeleton />
          </>
        }
      >
        <CoachOverview />
      </Suspense>
    </div>
  );
}
