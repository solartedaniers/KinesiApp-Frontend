import { Caption, GuideSection, panel, subtitle } from "./GuideSection";
import { Chronophotograph } from "../lab/Chronophotograph";
import { Protractor } from "../lab/Protractor";
import { Skeleton } from "../lab/Skeleton";

import { frameBounds, solvePose, SQUAT_PHASES } from "@/lib/design/pose";
import { getFormat, getT } from "@/lib/i18n/server";

const BOTTOM = SQUAT_PHASES[3].angles;
const bottom = solvePose(BOTTOM);
const box = frameBounds([bottom], 8);

const styles = {
  layout: "grid gap-4 lg:grid-cols-[1fr_1.2fr]",
  figure: `${panel} lab-scroll grid content-between gap-6`,
  skeleton: "mx-auto w-full max-w-[18rem] stroke-ink [stroke-width:1.4]",
  side: "grid gap-4",
};

export async function FiguresSection() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const fig = t.styleGuide.figures;
  return (
    <GuideSection id="figures" title={t.styleGuide.sections.figures} intro={fig.intro}>
      <div className={styles.layout}>
        <figure className={styles.figure}>
          <h3 className={subtitle}>{fig.skeletonTitle}</h3>
          <svg viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`} className={styles.skeleton} role="img" aria-label={fig.skeletonAlt}>
            <line x1={box.x} x2={box.x + box.width} y1={0.5} y2={0.5} className="stroke-line-strong [stroke-width:0.6]" />
            <Skeleton keypoints={bottom} />
          </svg>
          <Caption>{fig.skeletonCaption}</Caption>
        </figure>
        <div className={styles.side}>
          <figure className={styles.figure}>
            <h3 className={subtitle}>{fig.protractorTitle}</h3>
            <Protractor degrees={BOTTOM.knee} valueText={f.degrees(BOTTOM.knee)} label={fig.protractorLabel} />
            <Caption>{fig.protractorCaption}</Caption>
          </figure>
          <figure className={styles.figure}>
            <h3 className={subtitle}>{fig.squatTitle}</h3>
            <Chronophotograph phases={SQUAT_PHASES} label={fig.squatAlt} />
            <Caption>{fig.squatCaption}</Caption>
          </figure>
        </div>
      </div>
    </GuideSection>
  );
}
