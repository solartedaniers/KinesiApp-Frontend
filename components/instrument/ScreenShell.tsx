import Link from "next/link";
import type { ReactNode } from "react";

import { Glyph } from "./Glyph";
import { AiStatus } from "./Status";
import { Wordmark } from "./Wordmark";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import type { GlyphName } from "@/lib/design/icons";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export type ScreenId = "home" | "analysis" | "capture";

const TABS: { id: ScreenId; glyph: GlyphName }[] = [
  { id: "home", glyph: "overview" },
  { id: "analysis", glyph: "history" },
  { id: "capture", glyph: "capture" },
];

const styles = {
  top: "sticky top-0 z-20 border-b border-line bg-panel shadow-[0_10px_30px_-24px_var(--kin-shade)]",
  bar: "mx-auto flex h-16 max-w-content items-center gap-4 px-4 sm:px-6",
  tab:
    "relative inline-flex min-h-11 items-center gap-2 rounded-panel px-3 text-sm font-semibold text-ink-muted transition-colors " +
    "hover:bg-accent-soft hover:text-accent aria-[current=page]:text-accent aria-[current=page]:bg-accent-soft",
  bottom: "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] md:hidden",
  bottomTab:
    "relative grid min-h-14 flex-1 place-items-center content-center gap-0.5 text-xs font-semibold text-ink-muted " +
    "aria-[current=page]:text-accent aria-[current=page]:after:absolute aria-[current=page]:after:top-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:w-10 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-accent aria-[current=page]:after:shadow-[0_0_10px_var(--kin-accent)]",
};

/**
 * Marco de las pantallas de ejemplo: barra superior en computador y barra de pestañas abajo en el
 * celular, donde el pulgar llega. Las pestañas son las tres pantallas de la guía.
 */
export async function ScreenShell({ active, children }: { active: ScreenId; children: ReactNode }) {
  const t = await getT();
  const s = t.styleGuide.screens;
  const name: Record<ScreenId, string> = { home: t.nav.home, analysis: t.nav.analyses, capture: s.capture.title };
  const tabs = TABS.map((tab) => ({ ...tab, href: ROUTES.styleGuideScreen(tab.id), label: name[tab.id], current: tab.id === active ? ("page" as const) : undefined }));
  return (
    <div className="min-h-dvh pb-24 md:pb-10">
      <p className="bg-stage text-on-stage" data-theme="dark">
        <Link href={ROUTES.styleGuide} className="mx-auto flex min-h-11 max-w-content items-center gap-2 px-4 text-sm font-semibold sm:px-6 hover:underline">
          <Glyph name="chevronLeft" size={16} />
          {s.back}
          <span className="ml-auto font-normal opacity-80 max-sm:hidden">{s.label}</span>
        </Link>
      </p>
      <header className={styles.top}>
        <div className={styles.bar}>
          <Wordmark name={t.app.name} />
          <nav aria-label={t.nav.label} className="ml-4 max-md:hidden">
            <ul className="flex gap-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <Link href={tab.href} className={styles.tab} aria-current={tab.current}>
                    <Glyph name={tab.glyph} size={18} />
                    {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="max-sm:hidden"><AiStatus state="ready" label={t.styleGuide.components.aiReady} /></span>
            <PreferencesControls compact />
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-content gap-6 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <nav aria-label={t.nav.label} className={styles.bottom}>
        <ul className="flex">
          {tabs.map((tab) => (
            <li key={tab.id} className="flex flex-1">
              <Link href={tab.href} className={styles.bottomTab} aria-current={tab.current}>
                <Glyph name={tab.glyph} size={22} />
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
