import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { homeFor } from "@/lib/access";
import type { User } from "@/lib/types";

import { BfcacheGuard } from "./BfcacheGuard";
import { MobileMenu } from "./MobileMenu";
import { NavigationPanel } from "./NavigationPanel";
import { PreferencesControls } from "./PreferencesControls";

/**
 * Marco de la app autenticada según el rol: barra lateral desde tablet horizontal; en celular y
 * tablet vertical, barra superior con menú. Ambos muestran el mismo NavigationPanel. Las
 * preferencias van en la barra visible (la otra está oculta con display:none, fuera del árbol accesible).
 */
export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const home = homeFor(user.role);

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 hidden w-sidebar flex-col gap-6 border-r border-line bg-panel px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo href={home} />
        </div>
        <NavigationPanel user={user} />
        <PreferencesControls />
      </aside>

      <header className="sticky top-0 z-20 flex h-topbar items-center gap-2 border-b border-line bg-panel px-2 sm:px-4 lg:hidden">
        <MobileMenu>
          <NavigationPanel user={user} />
        </MobileMenu>
        <Logo href={home} size={26} collapsible />
        <div className="ml-auto">
          <PreferencesControls compact />
        </div>
      </header>

      <main className="lg:pl-sidebar">
        <div className="mx-auto w-full max-w-content px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</div>
      </main>
      <BfcacheGuard />
    </div>
  );
}
