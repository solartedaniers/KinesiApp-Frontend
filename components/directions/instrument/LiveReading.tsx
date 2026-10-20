import { LiveGauge } from "./LiveGauge";
import { PROPOSAL, TARGET_KNEE } from "../sample";

import { getT } from "@/lib/i18n/server";

/** Marco servidor de la lectura en vivo: textos y la primera repetición, que es lo único que viaja al cliente. */
export async function LiveReading() {
  const t = await getT();
  const g = t.styleGuide;
  return (
    <figure className="instrument-layer grid content-between gap-5 rounded-[1.25rem] bg-panel p-5 sm:p-6">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink [font-stretch:92%]">{g.directions.c.animationTitle}</h2>
      <LiveGauge
        samples={PROPOSAL.firstRepetition}
        target={TARGET_KNEE}
        labels={{ reading: g.live.reading, peak: g.live.peak, target: g.chart.target, skeleton: g.live.skeleton }}
      />
      <figcaption className="text-sm text-ink-muted">{g.directions.c.animationCaption}</figcaption>
    </figure>
  );
}
