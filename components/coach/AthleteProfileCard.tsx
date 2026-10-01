import { Avatar } from "@/components/app/Avatar";
import pageStyles from "@/components/app/Page.module.css";
import { ageOn } from "@/lib/analysis-stats";
import { formatHeight, formatWeight, todayInAppTimeZone } from "@/lib/format";
import { format, t } from "@/lib/i18n";
import type { AthleteProfile } from "@/lib/types";

import styles from "./AthleteProfileCard.module.css";

/** Ficha física de un deportista (sólo lectura; editarla llega en la Fase 3). */
export function AthleteProfileCard({ athlete }: { athlete: AthleteProfile }) {
  const details = [
    [t.athleteProfile.genderLabel, t.athleteProfile.gender[athlete.gender]],
    [t.athleteProfile.age, format(t.athleteProfile.ageValue, { years: ageOn(athlete.birth_date, todayInAppTimeZone()) })],
    [t.athleteProfile.height, formatHeight(athlete.height_cm)],
    [t.athleteProfile.weight, formatWeight(athlete.weight_kg)],
  ];
  return (
    <section className={`${pageStyles.card} ${styles.card}`} aria-label={t.coach.profile}>
      <div className={styles.identity}>
        <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} size="lg" />
        <div>
          <p className={styles.kind}>{athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount}</p>
          {athlete.is_managed && <p className={styles.hint}>{t.athleteProfile.managedHint}</p>}
        </div>
      </div>
      <dl className={styles.details}>
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
