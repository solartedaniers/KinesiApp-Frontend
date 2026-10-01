import type { Metadata } from "next";

import { ComingSoon } from "@/components/app/ComingSoon";
import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.users };

// Fase 2/3: usuarios y cambio de rol (§3). Sin datos todavía: la guarda de rol la aplica el layout
export default function AdminUsersPage() {
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.users} />
      <ComingSoon />
    </div>
  );
}
