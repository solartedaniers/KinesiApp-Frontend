import Link from "next/link";

import { RiskBadge } from "@/components/analysis/RiskBadge";
import { Avatar } from "@/components/app/Avatar";
import { EmptyState } from "@/components/app/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ageOn, type AthleteSummary } from "@/lib/analysis-stats";
import { todayInAppTimeZone } from "@/lib/format";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { coachAthletePath, ROUTES } from "@/lib/routes";
import type { AthleteProfile } from "@/lib/types";

import styles from "./AthleteRoster.module.css";

/** Tarjetas de los deportistas del coach con su último riesgo y cantidad de grabaciones. */
export async function AthleteRoster({ athletes, summaries }: { athletes: AthleteProfile[]; summaries: Map<number, AthleteSummary> }) {
  const t = await getT();
  if (athletes.length === 0) {
    return (
      <EmptyState icon="users" title={t.coach.rosterEmpty} body={t.coach.rosterEmptyHint}>
        <ButtonLink href={ROUTES.newCoachAthlete}>
          <Icon name="plus" size={18} />
          {t.coach.newAthlete}
        </ButtonLink>
      </EmptyState>
    );
  }
  const today = todayInAppTimeZone();

  return (
    <ul className={styles.grid}>
      {athletes.map((athlete) => {
        const summary = summaries.get(athlete.id);
        return (
          <li key={athlete.id}>
            <Link
              href={coachAthletePath(athlete.id)}
              className={styles.card}
              aria-label={format(t.coach.openAthlete, { name: athlete.display_name })}
            >
              <span className={styles.top}>
                <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} />
                <span className={styles.identity}>
                  <span className={styles.name}>{athlete.display_name}</span>
                  <span className={styles.meta}>
                    {format(t.athleteProfile.ageValue, { years: ageOn(athlete.birth_date, today) })} ·{" "}
                    {athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount}
                  </span>
                </span>
              </span>
              <span className={styles.bottom}>
                <span className={styles.meta}>
                  {summary ? format(t.coach.recordings, { count: summary.stats.total }) : t.coach.noRecordings}
                </span>
                {summary?.latestScore != null && <RiskBadge score={summary.latestScore} />}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
