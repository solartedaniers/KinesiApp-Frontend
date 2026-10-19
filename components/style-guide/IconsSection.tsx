import { GuideSection } from "./GuideSection";
import { LabIcon } from "../lab/LabIcon";

import { LAB_ICONS, type LabIconName } from "@/lib/design/icons";
import { getT } from "@/lib/i18n/server";

const styles = {
  grid: "grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-px overflow-hidden rounded-tag bg-line",
  cell: "grid justify-items-start gap-3 bg-panel p-4 text-ink",
  name: "text-sm text-ink-muted",
  large: "flex flex-wrap items-end gap-8 text-accent",
};

// Los de dominio, en grande: son los que dan carácter
const FEATURED: LabIconName[] = ["jump", "squat", "angle", "centerOfMass", "ai"];

export async function IconsSection() {
  const t = await getT();
  const names = t.styleGuide.icons.names;
  return (
    <GuideSection id="icons" title={t.styleGuide.sections.icons} intro={t.styleGuide.icons.intro}>
      <div className={styles.large} aria-hidden>
        {FEATURED.map((name) => <LabIcon key={name} name={name} size={64} />)}
      </div>
      <ul className={styles.grid}>
        {(Object.keys(LAB_ICONS) as LabIconName[]).map((name) => (
          <li key={name} className={styles.cell}>
            <LabIcon name={name} size={24} />
            <span className={styles.name}>{names[name]}</span>
          </li>
        ))}
      </ul>
    </GuideSection>
  );
}
