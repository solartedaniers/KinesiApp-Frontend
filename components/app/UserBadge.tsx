import { getT } from "@/lib/i18n/server";
import type { User } from "@/lib/types";

import { Avatar } from "./Avatar";

const styles = {
  badge: "flex items-center gap-3 px-2 py-1.5",
  text: "grid min-w-0 leading-tight",
  name: "truncate text-sm font-semibold text-ink",
  role: "text-xs text-ink-muted",
};

export async function UserBadge({ user }: { user: User }) {
  const t = await getT();
  return (
    <div className={styles.badge}>
      <Avatar name={user.full_name} imageUrl={user.avatar_url} />
      <span className={styles.text}>
        <span className={styles.name}>{user.full_name}</span>
        <span className={styles.role}>{t.roles[user.role]}</span>
      </span>
    </div>
  );
}
