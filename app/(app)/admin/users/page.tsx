import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { UsersTable } from "@/components/admin/AdminData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.users };

// SSR (§3): todas las cuentas; el cambio de rol (mutación) llega en la Fase 3
export default async function Page() {
  await requireRole(SECTION_ROLES.admin);
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.users} subtitle={t.admin.usersSubtitle} />
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
