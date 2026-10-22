import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { Glyph } from "@/components/instrument/Glyph";
import type { NavItem } from "@/lib/access";
import { getT } from "@/lib/i18n/server";
import type { User } from "@/lib/types";

import { Avatar } from "./Avatar";
import { PreferencesControls } from "./PreferencesControls";

const styles = {
  trigger: "grid size-11 place-items-center rounded-full transition-shadow hover:shadow-[0_0_0_3px_var(--kin-accent-soft)]",
  // Sin anclaje CSS (no está en todos los navegadores): el botón siempre queda arriba a la derecha de la barra
  panel:
    "kin-card fixed inset-auto top-[4.5rem] right-[max(1rem,calc((100vw-76rem)/2+1.5rem))] m-0 w-[min(20rem,calc(100vw-2rem))] gap-3 p-3 text-ink open:grid",
  item: "flex min-h-11 w-full items-center gap-3 rounded-panel px-3 text-sm font-semibold text-ink-muted hover:bg-accent-soft hover:text-accent",
};

/**
 * Menú de la cuenta con el atributo `popover`: el navegador lo abre y lo cierra con Escape o al tocar
 * fuera, sin JavaScript propio. Ahí van el perfil, las preferencias y el cierre de sesión.
 */
export async function AccountMenu({ user, profile }: { user: User; profile?: NavItem }) {
  const t = await getT();
  return (
    <>
      <button type="button" popoverTarget="account-menu" className={styles.trigger} aria-label={t.nav.openAccount}>
        <Avatar name={user.full_name} imageUrl={user.avatar_url} />
      </button>
      <div id="account-menu" popover="auto" className={styles.panel} aria-label={t.nav.account}>
        <div className="kin-well flex items-center gap-3 p-3">
          <Avatar name={user.full_name} imageUrl={user.avatar_url} />
          <span className="grid min-w-0 leading-tight">
            <span className="truncate text-sm font-semibold text-ink">{user.full_name}</span>
            <span className="text-xs text-ink-muted">{t.roles[user.role]}</span>
          </span>
        </div>
        {profile && (
          <Link href={profile.href} className={styles.item}>
            <Glyph name={profile.glyph} size={18} />
            {t.nav.profile}
          </Link>
        )}
        <PreferencesControls compact />
        <LogoutButton className={styles.item} label={t.session.logout}>
          <Glyph name="logout" size={18} />
          {t.session.logout}
        </LogoutButton>
      </div>
    </>
  );
}
