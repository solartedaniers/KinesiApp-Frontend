import { t } from "@/lib/i18n";
import type { User } from "@/lib/types";

import { Avatar } from "./Avatar";
import styles from "./UserBadge.module.css";

export function UserBadge({ user }: { user: User }) {
  return (
    <div className={styles.badge}>
      <Avatar name={user.full_name} imageUrl={user.avatar_data_url} />
      <span className={styles.text}>
        <span className={styles.name}>{user.full_name}</span>
        <span className={styles.role}>{t.roles[user.role]}</span>
      </span>
    </div>
  );
}
