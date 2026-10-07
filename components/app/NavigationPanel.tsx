import { LogoutButton } from "@/components/auth/LogoutButton";
import { RoleNav } from "@/components/RoleNav";
import { Icon } from "@/components/ui/Icon";
import { NAV_BY_ROLE } from "@/lib/access";
import { getT } from "@/lib/i18n/server";
import type { User } from "@/lib/types";

import { UserBadge } from "./UserBadge";

const styles = {
  panel: "flex flex-1 flex-col gap-6",
  nav: "flex-1",
  account: "grid gap-1 border-t border-line pt-4",
  logout: "flex min-h-control w-full items-center gap-3 rounded-control px-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:bg-sunken hover:text-ink",
};

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
