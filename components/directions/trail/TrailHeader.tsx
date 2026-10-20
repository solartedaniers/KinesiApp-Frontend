import Link from "next/link";

import { PROPOSAL_NAV } from "../sample";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import { LabIcon } from "@/components/lab/LabIcon";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

const styles = {
  bar: "mx-auto flex max-w-content flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-8",
  brand: "flex min-h-11 items-center gap-2.5 text-ink hover:no-underline",
  wordmark: "font-display text-xl font-semibold italic tracking-[-0.01em] [font-stretch:125%]",
  nav: "order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 lg:order-none lg:mx-0 lg:w-auto lg:px-0",
  link: "flex min-h-11 items-center gap-2 rounded-full px-3.5 text-sm font-medium whitespace-nowrap text-ink-muted hover:bg-sunken hover:text-ink hover:no-underline aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent",
  status: "flex items-center gap-2 text-sm text-ink-muted",
};

/** Marca de Estela: tres trazos de luz que convergen en un keypoint. */
function TrailMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path className="stroke-hue-3" d="M3 28C10 27 16 22 19 14" />
      <path className="stroke-hue-2" d="M3 22C11 21 18 16 23 9" />
      <path className="stroke-hue-1" d="M3 16C12 15 20 10 26 5" />
      <circle className="fill-ink" cx="26" cy="5" r="2.6" />
    </svg>
  );
}

export async function TrailHeader() {
  const t = await getT();
  return (
    <header>
      <div className={styles.bar}>
        <Link href={ROUTES.landing} className={styles.brand}>
          <TrailMark />
          <span className={styles.wordmark}>{t.app.name}</span>
        </Link>
        <nav aria-label={t.nav.label} className={styles.nav}>
          <ul className="flex gap-1">
            {PROPOSAL_NAV.map((item, i) => (
              <li key={item.key}>
                <Link href={item.href} className={styles.link} aria-current={i === 0 ? "page" : undefined}>
                  <LabIcon name={item.labIcon} size={18} />
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <p role="status" className={styles.status}>
            <span className="trail-led size-2 rounded-full bg-hue-1" aria-hidden />
            {t.styleGuide.header.aiReady}
          </p>
          <PreferencesControls compact />
        </div>
      </div>
      <div className="trail-streak h-px" aria-hidden />
    </header>
  );
}
