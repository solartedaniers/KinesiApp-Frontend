import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { homeFor } from "@/lib/access";
import type { User } from "@/lib/types";

import styles from "./AppShell.module.css";
import { BfcacheGuard } from "./BfcacheGuard";
import { MobileMenu } from "./MobileMenu";
import { NavigationPanel } from "./NavigationPanel";
import { PreferencesControls } from "./PreferencesControls";

/**
 * Marco de la app autenticada según el rol: barra lateral en escritorio; en celular, barra superior
 * con menú hamburguesa. Ambos muestran el mismo NavigationPanel.
 */
export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const home = homeFor(user.role);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Logo href={home} />
        <NavigationPanel user={user} />
      </aside>

      <header className={styles.topbar}>
        <MobileMenu>
          <NavigationPanel user={user} />
        </MobileMenu>
        <Logo href={home} size={28} />
      </header>

      <div className={styles.preferences}><PreferencesControls /></div>

      <main className={styles.content}>{children}</main>
      <BfcacheGuard />
    </div>
  );
}
