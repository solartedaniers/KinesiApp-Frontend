import { Icon, type IconName } from "@/components/ui/Icon";
import { getT } from "@/lib/i18n/server";
import type { AnalysisStatus } from "@/lib/types";

import styles from "./Badge.module.css";

const STYLE: Record<AnalysisStatus, { tone: string; icon: IconName }> = {
  pending: { tone: styles.neutral, icon: "clock" },
  processed: { tone: styles.success, icon: "check" },
  failed: { tone: styles.danger, icon: "alert" },
};

/** Estado con ícono y texto: nunca sólo color. */
export async function StatusBadge({ status }: { status: AnalysisStatus }) {
  const t = await getT();
  return (
    <span className={`${styles.badge} ${STYLE[status].tone}`}>
      <Icon name={STYLE[status].icon} size={14} />
      {t.analysis.status[status]}
    </span>
  );
}
