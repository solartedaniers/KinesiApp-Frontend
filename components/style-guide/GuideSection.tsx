import type { ReactNode } from "react";

const styles = {
  section: "lab-reveal grid scroll-mt-24 gap-8 py-16 sm:py-24",
  head: "grid gap-3 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12",
  title: "font-display text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-ink sm:text-5xl",
  intro: "max-w-prose text-lg text-ink",
};

/** Sección de la guía: título a la izquierda y su porqué al lado, luego el contenido a lo ancho. */
export function GuideSection({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={styles.section}>
      <div className={styles.head}>
        <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
        <p className={styles.intro}>{intro}</p>
      </div>
      {children}
    </section>
  );
}

/** Pie de figura en la serif itálica de las láminas científicas. */
export function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="max-w-prose font-display text-lg italic leading-snug text-ink-muted">{children}</figcaption>;
}

export const panel = "rounded-tag bg-panel p-5 sm:p-8";
export const subtitle = "text-xl font-semibold text-ink";
