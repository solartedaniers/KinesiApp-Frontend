import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton, TilesSkeleton } from "@/components/app/Skeleton";
import { AthleteOverview } from "@/components/athlete/AthleteData";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SECTION_ROLES } from "@/lib/access";
import { firstName } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.home };
}

// SSR streaming (§3): el saludo sale con el primer chunk; resumen y recientes llegan después
export default async function AthleteHomePage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.athlete);
  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <PageHeader title={format(t.home.greeting, { name: firstName(user.full_name) })} subtitle={t.home.athlete} />
        <ButtonLink href={ROUTES.newAnalysis}>
          <Icon name="upload" size={18} />
          {t.capture.newRecording}
        </ButtonLink>
      </div>
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
