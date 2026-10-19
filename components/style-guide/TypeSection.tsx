import { GuideSection, panel } from "./GuideSection";

import { getFormat, getT } from "@/lib/i18n/server";

const SCALE = [
  { key: "display", className: "font-display text-5xl font-medium tracking-[-0.02em]", size: "48" },
  { key: "title", className: "font-display text-3xl font-medium", size: "36" },
  { key: "metric", className: "font-mono text-3xl font-medium [font-variant-numeric:tabular-nums]", size: "36" },
  { key: "body", className: "text-base", size: "16" },
  { key: "small", className: "text-sm text-ink-muted", size: "14" },
] as const;

const styles = {
  specimens: "grid gap-4 lg:grid-cols-[1.4fr_1fr]",
  specimen: `${panel} grid content-between gap-6`,
  role: "text-sm text-ink-muted",
  display: "font-display text-6xl leading-[0.92] font-medium tracking-[-0.03em] text-ink text-balance sm:text-8xl",
  sans: "max-w-prose text-xl text-ink",
  mono: "font-mono text-6xl font-medium tracking-[-0.03em] text-ink [font-variant-numeric:tabular-nums] sm:text-7xl",
  side: "grid gap-4",
  scale: "grid divide-y divide-line",
  step: "grid grid-cols-[4rem_1fr] items-baseline gap-4 py-3",
  stepSize: "font-mono text-xs text-ink-muted [font-variant-numeric:tabular-nums]",
};

export async function TypeSection() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const ty = t.styleGuide.type;
  return (
    <GuideSection id="type" title={t.styleGuide.sections.type} intro={ty.intro}>
      <div className={styles.specimens}>
        <figure className={styles.specimen}>
          <p className={styles.display}>{ty.displaySample}</p>
          <figcaption className={styles.role}>{ty.displayRole}</figcaption>
        </figure>
        <div className={styles.side}>
          <figure className={styles.specimen}>
            <p className={styles.mono}>{f.degrees(108)}</p>
            <figcaption className={styles.role}>{ty.monoRole}</figcaption>
          </figure>
          <figure className={styles.specimen}>
            <p className={styles.sans}>{ty.sansSample}</p>
            <figcaption className={styles.role}>{ty.sansRole}</figcaption>
          </figure>
        </div>
      </div>
      <div className={panel}>
        <h3 className="mb-2 text-xl font-semibold text-ink">{ty.scale}</h3>
        <ul className={styles.scale}>
          {SCALE.map((step) => (
            <li key={step.key} className={styles.step}>
              <span className={styles.stepSize}>{step.size} px</span>
              <span className={`${step.className} text-ink`}>{ty.scaleNames[step.key]}</span>
            </li>
          ))}
        </ul>
      </div>
    </GuideSection>
  );
}
