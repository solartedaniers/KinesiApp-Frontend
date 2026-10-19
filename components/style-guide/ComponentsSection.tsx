import Link from "next/link";

import { GuideSection, panel, subtitle } from "./GuideSection";
import { AiStatus, type AiState } from "../lab/AiStatus";
import { LabButton } from "../lab/Button";
import { LabCheckbox } from "../lab/Checkbox";
import { Notice } from "../lab/Notice";
import { OptionPicker } from "../lab/OptionPicker";
import { ResultTag } from "../lab/ResultTag";
import { RiskTag } from "../lab/Risk";
import { LabTextField } from "../lab/TextField";

import { SAMPLE_ANALYSIS } from "@/lib/design/sample-analysis";
import { getFormat, getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

const AI_STATES: AiState[] = ["waking", "ready", "unavailable"];

const styles = {
  layout: "grid gap-4 lg:grid-cols-[1fr_1fr]",
  column: "grid content-start gap-4",
  block: `${panel} grid gap-5`,
  row: "flex flex-wrap items-center gap-3",
  stack: "grid gap-3",
};

export async function ComponentsSection() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const c = t.styleGuide.components;
  const peak = Math.max(...SAMPLE_ANALYSIS.repetitions.map((rep) => rep.peakKnee));
  return (
    <GuideSection id="components" title={t.styleGuide.sections.components} intro={c.intro}>
      <div className={styles.layout}>
        <div className={styles.column}>
          <div className={styles.block}>
            <h3 className={subtitle}>{c.fields}</h3>
            <LabTextField name="sg-email" type="email" label={c.emailLabel} hint={c.emailHint} autoComplete="off" />
            <LabTextField name="sg-height" inputMode="numeric" label={c.heightLabel} unit={c.heightUnit} defaultValue="98" error={c.heightError} />
            <OptionPicker
              name="sg-movement"
              legend={c.movement}
              defaultValue="squat"
              options={[
                { value: "jump", label: t.analysis.movement.jump, icon: "jump" },
                { value: "squat", label: t.analysis.movement.squat, icon: "squat" },
              ]}
            />
            <div>
              <LabCheckbox name="sg-consent">{c.consent}</LabCheckbox>
              <Link className="ml-9 text-sm" href={ROUTES.legalVideoConsent}>{c.consentLink}</Link>
            </div>
          </div>
          <div className={styles.block}>
            <h3 className={subtitle}>{c.buttons}</h3>
            <div className={styles.row}>
              <LabButton icon="upload">{c.primary}</LabButton>
              <LabButton variant="secondary" icon="history">{c.secondary}</LabButton>
              <LabButton variant="quiet">{c.quiet}</LabButton>
            </div>
            <div className={styles.row}>
              <LabButton pending pendingLabel={c.pending}>{c.primary}</LabButton>
              <LabButton variant="secondary" disabled>{c.disabled}</LabButton>
            </div>
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.block}>
            <h3 className={subtitle}>{c.aiTitle}</h3>
            <div className={styles.stack}>
              {AI_STATES.map((state) => <AiStatus key={state} state={state} label={c.aiStates[state]} hint={c.aiHints[state]} />)}
            </div>
          </div>
          <div className={styles.block}>
            <h3 className={subtitle}>{c.noticeTitle}</h3>
            <Notice tone="info">{c.noticeInfo}</Notice>
            <Notice tone="error">{c.noticeError}</Notice>
          </div>
          <div className="grid gap-3">
            <h3 className={subtitle}>{c.tagTitle}</h3>
            <ResultTag
              movementIcon="squat"
              movement={t.analysis.movement.squat}
              date={f.dateTime("2026-10-14T15:20:00Z")}
              metric={f.degrees(peak)}
              metricLabel={c.tag.peak}
              rows={[
                { label: c.tag.athlete, value: c.tag.athleteName },
                { label: c.tag.repetitions, value: <span className="font-mono">{SAMPLE_ANALYSIS.repetitions.length}</span> },
                { label: c.tag.risk, value: <RiskTag level={SAMPLE_ANALYSIS.level} label={t.analysis.riskShort[SAMPLE_ANALYSIS.level]} value={f.percent(SAMPLE_ANALYSIS.score)} /> },
              ]}
              action={<LabButton variant="secondary" icon="chevronRight" block>{c.tag.open}</LabButton>}
            />
          </div>
        </div>
      </div>
    </GuideSection>
  );
}
