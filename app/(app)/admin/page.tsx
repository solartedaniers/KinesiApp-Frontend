import type { Metadata } from "next";
import { Suspense } from "react";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { TilesSkeleton } from "@/components/app/Skeleton";
import { AdminOverview } from "@/components/admin/AdminData";
import { SECTION_ROLES } from "@/lib/access";
import { firstName } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.home };
}

// SSR streaming (§3): saludo inmediato; el resumen del sistema llega en un chunk posterior
export default async function AdminHomePage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.admin);
  return (
    <div className={styles.page}>
      <PageHeader title={format(t.home.greeting, { name: firstName(user.full_name) })} subtitle={t.home.admin} />
      <Suspense fallback={<TilesSkeleton count={5} />}>
        <AdminOverview />
      </Suspense>
    </div>
  );
}
