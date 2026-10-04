import { Avatar } from "@/components/app/Avatar";
import pageStyles from "@/components/app/Page.module.css";
import { ageOn } from "@/lib/analysis-stats";
import { todayInAppTimeZone } from "@/lib/format";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import type { AthleteProfile } from "@/lib/types";

import styles from "./AthleteProfileCard.module.css";

/** Ficha física de un deportista, sólo lectura (la edición tiene su propia página). */
export async function AthleteProfileCard({ athlete }: { athlete: AthleteProfile }) {
  const t = await getT();
  const fmt = await getFormat();
  const details = [
    [t.athleteProfile.genderLabel, t.athleteProfile.gender[athlete.gender]],
    [t.athleteProfile.age, format(t.athleteProfile.ageValue, { years: ageOn(athlete.birth_date, todayInAppTimeZone()) })],
    [t.athleteProfile.height, fmt.height(athlete.height_cm)],
    [t.athleteProfile.weight, fmt.weight(athlete.weight_kg)],
  ];
  return (
    <section className={`${pageStyles.card} ${styles.card}`} aria-label={t.coach.profile}>
      <div className={styles.identity}>
        <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} size="lg" />
        <div>
          <p className={styles.kind}>{athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount}</p>
          <p className={styles.hint}>{athlete.is_managed ? t.athleteProfile.managedHint : t.coach.accountAthleteHint}</p>
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
