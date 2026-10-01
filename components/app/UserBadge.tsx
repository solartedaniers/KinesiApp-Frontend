import { t } from "@/lib/i18n";
import type { User } from "@/lib/types";

import styles from "./UserBadge.module.css";

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function UserBadge({ user }: { user: User }) {
  return (
    <div className={styles.badge}>
      {user.avatar_data_url ? (
        // Data URL del backend: next/image no aporta nada sobre una imagen ya inline
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.avatar} src={user.avatar_data_url} alt="" />
      ) : (
        <span className={styles.avatar} aria-hidden>
          {initials(user.full_name)}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.name}>{user.full_name}</span>
        <span className={styles.role}>{t.roles[user.role]}</span>
      </span>
    </div>
  );
}
