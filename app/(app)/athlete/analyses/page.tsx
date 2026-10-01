import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { AthleteAnalyses } from "@/components/athlete/AthleteData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.analyses };

// SSR streaming (§3): lista de sólo lectura detrás del encabezado
export default async function Page() {
  await requireRole(SECTION_ROLES.athlete);
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.analyses} />
      <Suspense
        fallback={
          <ListSkeleton rows={5} />
        }
      >
        <AthleteAnalyses />
      </Suspense>
    </div>
  );
}
