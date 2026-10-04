import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { AssignmentsTable } from "@/components/admin/AdminData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.assignments };
}

// SSR (§3): entrenador de cada deportista, con la asignación en la misma fila
export default async function Page() {
  const t = await getT();
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
