import Link from "next/link";

import { PROPOSAL_NAV } from "../sample";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import { LabIcon } from "@/components/lab/LabIcon";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

const styles = {
  bar: "rhythm-float mx-auto flex max-w-content flex-wrap items-center gap-x-4 gap-y-1 rounded-[1.75rem] bg-panel px-3 py-2 ring-1 ring-line lg:rounded-full lg:px-4",
  brand: "flex min-h-11 items-center gap-2 pr-2 text-ink hover:no-underline",
  wordmark: "font-display text-lg font-semibold tracking-[-0.02em]",
  nav: "order-last w-full overflow-x-auto lg:order-none lg:w-auto",
  link: "flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap text-ink-muted hover:bg-sunken hover:text-ink hover:no-underline aria-[current=page]:bg-accent aria-[current=page]:text-on-accent",
  status: "flex min-h-9 items-center gap-2 rounded-full bg-sunken px-3 text-sm font-medium text-ink",
};

/** Marca de Ritmo: el anillo del pulso con el keypoint de la rodilla en su punto más bajo. */
function RhythmMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" strokeLinecap="round" aria-hidden>
      <circle cx="16" cy="16" r="12" className="stroke-hue-1" strokeWidth="3.5" strokeDasharray="56 20" transform="rotate(115 16 16)" />
      <circle cx="16" cy="16" r="5.5" className="stroke-hue-2" strokeWidth="3" />
      <circle cx="16" cy="28" r="3" className="fill-hue-3" />
    </svg>
  );
}

export async function RhythmHeader() {
  const t = await getT();
  return (
    <header className="px-3 pt-3 sm:px-6 sm:pt-5">
      <div className={styles.bar}>
        <Link href={ROUTES.landing} className={styles.brand}>
          <RhythmMark />
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
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <p role="status" className={styles.status}>
            <span className="rhythm-beat size-2.5 rounded-full bg-hue-2" aria-hidden />
            {t.styleGuide.header.aiReady}
          </p>
          <PreferencesControls compact />
        </div>
      </div>
    </header>
  );
}
