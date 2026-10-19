import { Caption, GuideSection, panel, subtitle } from "./GuideSection";
import { ProgressSimulation } from "./ProgressSimulation";
import { TransitionDemo } from "./TransitionDemo";
import { Chronophotograph } from "../lab/Chronophotograph";

import { JUMP_PHASES } from "@/lib/design/pose";
import { getFormat, getT } from "@/lib/i18n/server";

const styles = {
  wide: `${panel} grid gap-6`,
  scroll: `${panel} lab-scroll grid gap-6`,
};

export async function MotionSection() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const m = t.styleGuide.motion;
  const c = t.styleGuide.components;
  const tags = [
    { id: "jump", movementIcon: "jump" as const, movement: t.analysis.movement.jump, metric: f.degrees(96), date: f.dateTime("2026-10-02T14:05:00Z") },
    { id: "squat", movementIcon: "squat" as const, movement: t.analysis.movement.squat, metric: f.degrees(112), date: f.dateTime("2026-10-14T15:20:00Z") },
  ].map((tag) => ({ ...tag, metricLabel: c.tag.peak, detail: m.transitionCaption, rows: [{ label: c.tag.athlete, value: c.tag.athleteName }] }));

  return (
    <GuideSection id="motion" title={t.styleGuide.sections.motion} intro={m.intro}>
      <figure className={styles.wide}>
        <h3 className={subtitle}>{m.progressTitle}</h3>
        <ProgressSimulation labels={{ stages: m.stages, frames: m.frames, plate: t.styleGuide.heroAlt, start: m.start, restart: m.restart }} />
        <Caption>{m.progressCaption}</Caption>
      </figure>
      <div className={styles.wide}>
        <h3 className={subtitle}>{m.transitionTitle}</h3>
        <TransitionDemo items={tags} labels={{ open: m.openDetail, close: m.closeDetail }} />
      </div>
      <figure className={styles.scroll}>
        <h3 className={subtitle}>{m.scrollTitle}</h3>
        <Chronophotograph phases={JUMP_PHASES} label={t.styleGuide.heroAlt} />
        <Caption>{m.scrollCaption}</Caption>
      </figure>
    </GuideSection>
  );
}
