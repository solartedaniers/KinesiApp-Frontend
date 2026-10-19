import Link from "next/link";
import type { ReactNode } from "react";

import { DIRECTION_IDS, type DirectionId } from "@/lib/design/directions";
import { DIRECTION_FONT_VARIABLES } from "@/lib/design/fonts";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

const styles = {
  intro: "grid gap-6 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
  eyebrow: "text-sm font-semibold text-accent",
  title: "mt-1 font-display text-5xl font-semibold tracking-[-0.02em] text-ink sm:text-6xl",
  phrase: "mt-4 max-w-prose text-lg text-ink-muted text-pretty",
  switcher: "flex gap-1 rounded-full bg-sunken p-1",
  option: "grid min-h-11 min-w-11 place-items-center rounded-full px-4 text-sm font-semibold text-ink-muted hover:text-ink hover:no-underline aria-[current=page]:bg-panel aria-[current=page]:text-ink aria-[current=page]:shadow-sm",
  note: "mt-12 text-sm text-ink-muted",
};

/** Marco común de cada dirección: sus tokens y fuentes, el encabezado propio y la frase del concepto. */
export async function DirectionShell({ id, header, children }: { id: DirectionId; header: ReactNode; children: ReactNode }) {
  const t = await getT();
  const g = t.styleGuide;
  return (
    <div data-design={id} className={`${DIRECTION_FONT_VARIABLES[id]} min-h-dvh`}>
      {header}
      <main className="mx-auto max-w-content px-4 pb-20 sm:px-8">
        <section className={styles.intro} aria-labelledby="direction-title">
          <div>
            <p className={styles.eyebrow}>{format(g.directionLabel, { id: id.toUpperCase() })}</p>
            <h1 id="direction-title" className={styles.title}>{g.directions[id].name}</h1>
            <p className={styles.phrase}>{g.directions[id].phrase}</p>
          </div>
          <nav aria-label={g.switcher}>
            <ul className={styles.switcher}>
              {DIRECTION_IDS.map((option) => (
                <li key={option}>
                  <Link
                    href={ROUTES.styleGuideDirection(option)}
                    className={styles.option}
                    aria-current={option === id ? "page" : undefined}
                    title={g.directions[option].name}
                  >
                    {option.toUpperCase()}
                    <span className="visually-hidden">{g.directions[option].name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>
        {children}
        <p className={styles.note}>{g.sampleNote}</p>
      </main>
    </div>
  );
}
