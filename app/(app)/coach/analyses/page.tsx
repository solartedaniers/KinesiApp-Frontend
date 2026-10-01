import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { TeamAnalyses } from "@/components/coach/CoachData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.team };

// SSR streaming (§3): la consulta más pesada del coach, detrás del encabezado
export default async function Page() {
  await requireRole(SECTION_ROLES.coach);
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.team} />
      <Suspense
        fallback={
          <ListSkeleton rows={5} />
        }
      >
        <TeamAnalyses />
      </Suspense>
    </div>
  );
}
