import Link from "next/link";
import type { ReactNode } from "react";

import { AiStatusIndicator } from "@/components/ai/AiStatusIndicator";
import { shellStyles as styles } from "@/components/instrument/shell-classes";
import { Wordmark } from "@/components/instrument/Wordmark";
import { homeFor, NAV_BY_ROLE } from "@/lib/access";
import { getT } from "@/lib/i18n/server";
import type { User } from "@/lib/types";

import { AccountMenu } from "./AccountMenu";
import { AppNav } from "./AppNav";
import { BfcacheGuard } from "./BfcacheGuard";

/**
 * Marco de la app, el mismo de las pantallas de la guía: barra superior con relieve y pestañas en el
 * computador; en celular y tablet las pestañas bajan adonde llega el pulgar. El perfil, las
 * preferencias y el cierre de sesión van en el menú de la cuenta.
 */
export async function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const t = await getT();
  const items = NAV_BY_ROLE[user.role];
  const tabs = items.filter((item) => item.key !== "profile");
  return (
    <div className="kin-ambient min-h-dvh pb-24 xl:pb-10">
      <header className={styles.top}>
        <div className={styles.bar}>
          <Link href={homeFor(user.role)} aria-label={t.app.name} className="rounded-panel">
            <Wordmark name={t.app.name} />
          </Link>
          <AppNav items={tabs} placement="top" />
          <div className="ml-auto flex items-center gap-3">
            <span className="max-sm:hidden"><AiStatusIndicator /></span>
            <AccountMenu user={user} profile={items.find((item) => item.key === "profile")} />
          </div>
        </div>
      </header>
      {/* En el celular el estado de la IA no cabe en la barra: lo muestro arriba del contenido */}
      <div className="mx-auto max-w-content px-4 pt-4 sm:hidden"><AiStatusIndicator /></div>
      <main className={styles.main}>{children}</main>
      <AppNav items={tabs} placement="bottom" />
      <BfcacheGuard />
    </div>
  );
}
