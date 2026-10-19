import { Caption } from "./GuideSection";
import { PreferencesControls } from "../app/PreferencesControls";
import { Chronophotograph } from "../lab/Chronophotograph";
import { LabLogo } from "../lab/LabLogo";

import { JUMP_PHASES } from "@/lib/design/pose";
import { getT } from "@/lib/i18n/server";

export const GUIDE_SECTIONS = ["color", "type", "icons", "figures", "components", "charts", "motion"] as const;

const styles = {
  // En el celular la barra no se fija: con el índice ocuparía un tercio de la pantalla
  bar: "z-10 bg-canvas lg:sticky lg:top-0 lg:bg-canvas/95 shadow-[0_1px_0_var(--kin-line)]",
  barInner: "mx-auto flex max-w-content flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-8",
  index: "order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 lg:order-none lg:mx-0 lg:w-auto lg:px-0",
  indexList: "flex gap-1 whitespace-nowrap",
  indexLink: "inline-flex min-h-11 items-center rounded-tag px-3 text-sm font-semibold text-ink-muted no-underline hover:bg-sunken hover:text-ink hover:no-underline",
  hero: "grid items-end gap-10 py-12 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
  copy: "grid gap-6",
  title: "font-display text-5xl leading-[0.95] font-medium tracking-[-0.03em] text-ink text-balance sm:text-7xl",
  lead: "max-w-prose text-xl text-ink",
  note: "max-w-prose text-sm text-ink-muted",
  figure: "grid gap-4",
  plate: "w-full",
};

export async function GuideHeader() {
  const t = await getT();
  const sg = t.styleGuide;
  return (
    <>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <LabLogo name={t.app.name} />
          <nav aria-label={sg.indexLabel} className={styles.index}>
            <ul className={styles.indexList}>
              {GUIDE_SECTIONS.map((id) => (
                <li key={id}><a className={styles.indexLink} href={`#${id}`}>{sg.sections[id]}</a></li>
              ))}
            </ul>
          </nav>
          <PreferencesControls compact />
        </div>
      </header>
      <div className="mx-auto max-w-content px-4 sm:px-8">
        <div className={styles.hero}>
          <div className={styles.copy}>
            <h1 className={styles.title}>{sg.title}</h1>
            <p className={styles.lead}>{sg.lead}</p>
            <p className={styles.note}>{sg.sampleNote}</p>
          </div>
          <figure className={styles.figure}>
            <Chronophotograph phases={JUMP_PHASES} label={sg.heroAlt} className={styles.plate} />
            <Caption>{sg.heroCaption}</Caption>
          </figure>
        </div>
      </div>
    </>
  );
}
