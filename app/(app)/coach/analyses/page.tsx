import type { Metadata } from "next";

import { ComingSoon } from "@/components/app/ComingSoon";
import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.team };

// Fase 2: análisis del equipo, SSR streaming (§3). Sin datos todavía: la guarda de rol la aplica el layout
export default function CoachTeamAnalysesPage() {
  return (
    <div className={styles.page}>
      <PageHeader title={t.nav.team} />
      <ComingSoon />
    </div>
  );
}
