import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { AssignmentsTable } from "@/components/admin/AdminData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.assignments };

// SSR (§3): entrenador de cada deportista; asignar (mutación) llega en la Fase 3
export default async function Page() {
  await requireRole(SECTION_ROLES.admin);
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.assignments} subtitle={t.admin.assignmentsSubtitle} />
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <AssignmentsTable />
      </Suspense>
    </div>
  );
}
