import { badgeStyles } from "@/components/ui/badge-classes";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { AccountStatus } from "@/lib/admin-stats";
import { getT } from "@/lib/i18n/server";

const STYLE: Record<AccountStatus, { tone: string; icon: IconName }> = {
  active: { tone: badgeStyles.positive, icon: "check" },
  unverified: { tone: badgeStyles.neutral, icon: "clock" },
  disabled: { tone: badgeStyles.attention, icon: "alert" },
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
