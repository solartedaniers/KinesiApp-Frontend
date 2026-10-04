import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { TeamAnalyses } from "@/components/coach/CoachData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.analyses };
}

// SSR streaming (§3): la consulta más pesada del coach, detrás del encabezado
export default async function Page() {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.analyses} />
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
