import Link from "next/link";

import { PROPOSAL_NAV } from "../sample";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import { LabIcon } from "@/components/lab/LabIcon";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

const styles = {
  bar: "mx-auto flex max-w-content flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-8",
  brand: "flex min-h-11 items-center gap-2 text-ink hover:no-underline",
  wordmark: "font-display text-xl font-semibold tracking-[-0.01em] [font-stretch:92%]",
  nav: "order-last w-full overflow-x-auto pb-1 lg:order-none lg:w-auto lg:pb-0",
  track: "instrument-inset flex w-max gap-0.5 rounded-[0.875rem] bg-sunken p-1",
  link: "flex min-h-11 items-center gap-2 rounded-[0.625rem] px-3.5 text-sm font-medium whitespace-nowrap text-ink-muted hover:text-ink hover:no-underline aria-[current=page]:bg-panel aria-[current=page]:text-ink aria-[current=page]:shadow-[0_1px_2px_rgb(15_25_35/0.12),0_4px_12px_-6px_rgb(15_25_35/0.2)]",
  status: "flex min-h-9 items-center gap-2 rounded-[0.625rem] bg-sunken px-3 text-sm font-medium text-ink",
};

/** Marca de Instrumento: media esfera con su aguja marcando una flexión. */
function InstrumentMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" strokeLinecap="round" aria-hidden>
      <path d="M4 22a12 12 0 0 1 24 0" className="stroke-line-strong" strokeWidth="3" />
      <path d="M4 22a12 12 0 0 1 17.5-10.7" className="stroke-accent" strokeWidth="3" />
      <path d="M16 22l6-8" className="stroke-ink" strokeWidth="2.2" />
      <circle cx="16" cy="22" r="2.4" className="fill-ink" />
    </svg>
  );
}

export async function InstrumentHeader() {
  const t = await getT();
  return (
    <header className="instrument-layer relative z-10 bg-panel">
      <div className={styles.bar}>
        <Link href={ROUTES.landing} className={styles.brand}>
          <InstrumentMark />
          <span className={styles.wordmark}>{t.app.name}</span>
        </Link>
        <nav aria-label={t.nav.label} className={styles.nav}>
          <ul className={styles.track}>
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
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <p role="status" className={styles.status}>
            <span className="instrument-led size-2 rounded-full bg-accent" aria-hidden />
            {t.styleGuide.header.aiReady}
          </p>
          <PreferencesControls compact />
        </div>
      </div>
    </header>
  );
}
