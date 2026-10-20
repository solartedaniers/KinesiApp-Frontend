import type { Metadata } from "next";
import Link from "next/link";

import { LabIcon } from "@/components/lab/LabIcon";
import { DIRECTION_IDS } from "@/lib/design/directions";
import { DIRECTION_FONT_VARIABLES } from "@/lib/design/fonts";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  // Es una herramienta de revisión del rediseño: no la indexo
  return { title: t.styleGuide.metaTitle, description: t.styleGuide.lead, robots: { index: false, follow: false } };
}

const styles = {
  band: "border-t border-line",
  inner: "mx-auto grid max-w-content gap-4 px-4 py-10 sm:px-8 md:grid-cols-[12rem_minmax(0,1fr)_auto] md:items-center md:gap-8",
  letter: "text-sm font-semibold text-accent",
  name: "font-display text-4xl font-semibold tracking-[-0.02em] text-ink",
  link: "inline-flex min-h-11 items-center gap-2 justify-self-start rounded-full bg-accent px-5 font-semibold whitespace-nowrap text-on-accent hover:bg-accent-hover hover:no-underline",
};

/** Índice de las direcciones: cada franja ya se pinta con los tokens y las fuentes de la suya. */
export default async function StyleGuideIndexPage() {
  const t = await getT();
  const g = t.styleGuide;
  return (
    <main>
      <header className="mx-auto max-w-content px-4 py-12 sm:px-8 sm:py-16">
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">{g.title}</h1>
        <p className="mt-4 max-w-prose text-lg text-ink-muted">{g.lead}</p>
      </header>
      {DIRECTION_IDS.map((id) => (
        <section key={id} data-design={id} className={`${DIRECTION_FONT_VARIABLES[id]} ${styles.band}`} aria-labelledby={`direction-${id}`}>
          <div className={styles.inner}>
            <div>
              <p className={styles.letter}>{format(g.directionLabel, { id: id.toUpperCase() })}</p>
              <h2 id={`direction-${id}`} className={styles.name}>{g.directions[id].name}</h2>
            </div>
            <p className="max-w-prose text-lg text-ink-muted">{g.directions[id].phrase}</p>
            <Link href={ROUTES.styleGuideDirection(id)} className={styles.link}>
              {format(g.open, { id: id.toUpperCase() })}
              <LabIcon name="chevronRight" size={18} />
            </Link>
          </div>
        </section>
      ))}
    </main>
  );
}
