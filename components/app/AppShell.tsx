import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { Logo } from "@/components/brand/Logo";
import { RoleNav } from "@/components/RoleNav";
import { Icon } from "@/components/ui/Icon";
import { homeFor, NAV_BY_ROLE } from "@/lib/access";
import { t } from "@/lib/i18n";
import type { User } from "@/lib/types";

import styles from "./AppShell.module.css";
import { BfcacheGuard } from "./BfcacheGuard";
import { UserBadge } from "./UserBadge";

/**
 * Marco de la app autenticada según el rol: barra lateral en escritorio; barra superior y
 * navegación inferior en celular. Server Component: sólo RoleNav y BfcacheGuard son de cliente.
 */
export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const items = NAV_BY_ROLE[user.role];
  const home = homeFor(user.role);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Logo href={home} />
        <RoleNav items={items} variant="sidebar" className={styles.sidebarNav} />
        <div className={styles.account}>
          <UserBadge user={user} />
          <LogoutButton className={styles.logout} label={t.session.logout}>
            <Icon name="logout" />
            <span>{t.session.logout}</span>
          </LogoutButton>
        </div>
      </aside>

      <header className={styles.topbar}>
        <Logo href={home} size={28} />
        <LogoutButton className={styles.iconButton} label={t.session.logout}>
          <Icon name="logout" />
        </LogoutButton>
      </header>

      <main className={styles.content}>{children}</main>

      <RoleNav items={items} variant="bottom" className={styles.bottomNav} />
      <BfcacheGuard />
    </div>
  );
}
