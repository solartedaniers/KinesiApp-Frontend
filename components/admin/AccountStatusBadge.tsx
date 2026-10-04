import badgeStyles from "@/components/analysis/Badge.module.css";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { AccountStatus } from "@/lib/admin-stats";
import { getT } from "@/lib/i18n/server";

const STYLE: Record<AccountStatus, { tone: string; icon: IconName }> = {
  active: { tone: badgeStyles.success, icon: "check" },
  unverified: { tone: badgeStyles.neutral, icon: "clock" },
  disabled: { tone: badgeStyles.danger, icon: "alert" },
};

export async function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const t = await getT();
  return (
    <span className={`${badgeStyles.badge} ${STYLE[status].tone}`}>
      <Icon name={STYLE[status].icon} size={14} />
      {t.admin.status[status]}
    </span>
  );
}
