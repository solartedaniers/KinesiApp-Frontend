import type { Metadata } from "next";

import { AccountPanel } from "@/components/app/AccountPanel";
import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.profile };

// Fase 3 agrega aquí la edición del nombre y el avatar (§3)
export default async function AdminProfilePage() {
  const user = await requireRole(SECTION_ROLES.admin);
  return (
    <div className={styles.page}>
      <PageHeader title={t.account.title} />
      <AccountPanel user={user} />
    </div>
  );
}
