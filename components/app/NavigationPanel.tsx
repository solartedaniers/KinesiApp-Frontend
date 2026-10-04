import { LogoutButton } from "@/components/auth/LogoutButton";
import { RoleNav } from "@/components/RoleNav";
import { Icon } from "@/components/ui/Icon";
import { NAV_BY_ROLE } from "@/lib/access";
import { getT } from "@/lib/i18n/server";
import type { User } from "@/lib/types";

import styles from "./NavigationPanel.module.css";
import { UserBadge } from "./UserBadge";

/** Navegación del rol + preferencias, usuario y cierre de sesión: la barra lateral y el menú móvil lo comparten. */
export async function NavigationPanel({ user }: { user: User }) {
  const t = await getT();
  return (
    <div className={styles.panel}>
      <RoleNav items={NAV_BY_ROLE[user.role]} className={styles.nav} />
      <div className={styles.account}>
        <UserBadge user={user} />
        <LogoutButton className={styles.logout} label={t.session.logout}>
          <Icon name="logout" />
          <span>{t.session.logout}</span>
        </LogoutButton>
      </div>
    </div>
  );
}
