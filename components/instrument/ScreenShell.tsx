import Link from "next/link";
import type { ReactNode } from "react";

import { Glyph } from "./Glyph";
import { shellStyles as styles } from "./shell-classes";
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
      <main className={styles.main}>{children}</main>
      <nav aria-label={t.nav.label} className={`${styles.bottom} md:hidden`}>
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
