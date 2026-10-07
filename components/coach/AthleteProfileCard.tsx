import { Avatar } from "@/components/app/Avatar";
import { pageStyles } from "@/components/app/page-classes";
import { ageOn } from "@/lib/analysis-stats";
import { todayInAppTimeZone } from "@/lib/format";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import type { AthleteProfile } from "@/lib/types";

const styles = {
  card: "gap-5",
  identity: "flex items-center gap-4",
  kind: "font-semibold text-ink",
  hint: "text-sm text-ink-muted",
  details: "grid grid-cols-2 gap-4 border-t border-line pt-5 md:grid-cols-4 [&_dd]:mt-0.5 [&_dd]:font-display [&_dd]:text-lg [&_dd]:font-semibold [&_dd]:tabular-nums [&_dt]:text-sm [&_dt]:text-ink-muted",
};

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
