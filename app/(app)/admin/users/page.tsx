import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { UsersTable } from "@/components/admin/AdminData";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.users };
}

// SSR (§3): todas las cuentas, con cambio de rol y activación por fila
export default async function Page() {
  const t = await getT();
  const admin = await requireRole(SECTION_ROLES.admin);
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.users} subtitle={t.admin.usersSubtitle} />
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <UsersTable currentUserId={admin.id} />
      </Suspense>
    </div>
  );
}
