import { ageOn } from "@/lib/analysis-stats";
import { todayInAppTimeZone } from "@/lib/format";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import type { AthleteProfile } from "@/lib/types";

/** Ficha física en pozos, sólo lectura (la edición tiene su propia página). */
export async function AthleteProfileCard({ athlete }: { athlete: AthleteProfile }) {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const details = [
    [t.athleteProfile.genderLabel, t.athleteProfile.gender[athlete.gender]],
    [t.athleteProfile.age, format(t.athleteProfile.ageValue, { years: ageOn(athlete.birth_date, todayInAppTimeZone()) })],
    [t.athleteProfile.height, f.height(athlete.height_cm)],
    [t.athleteProfile.weight, f.weight(athlete.weight_kg)],
  ];
  return (
    <section aria-labelledby="athlete-profile" className="kin-card grid gap-4 p-5 sm:p-6">
      <h2 id="athlete-profile" className="font-display text-xl font-semibold text-ink">{t.coach.profile}</h2>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {details.map(([label, value]) => (
          <div key={label} className="kin-well grid gap-1 p-3">
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="font-display text-2xl font-semibold text-ink [font-variant-numeric:tabular-nums]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
