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

// Una fila por deportista, columnas alineadas para escanear el riesgo de un vistazo. En celular,
// nombre y datos en dos líneas con el riesgo a la derecha (los encabezados se ocultan)
const COLUMNS = "md:grid-cols-[minmax(0,2.2fr)_5rem_7.5rem_7.5rem_9rem_1.25rem]";

/** Lista de los deportistas del coach con su último riesgo y cantidad de grabaciones. */
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
    <div className="overflow-hidden rounded-panel border border-line bg-panel">
      <div className={`hidden gap-4 border-b border-line bg-sunken px-4 py-2.5 text-sm font-medium text-ink-muted md:grid ${COLUMNS}`} aria-hidden>
        <span>{t.coach.athleteMetaTitle}</span>
        <span>{t.athleteProfile.age}</span>
        <span>{t.coach.accountColumn}</span>
        <span>{t.coach.recordingsTitle}</span>
        <span>{t.coach.latestRisk}</span>
        <span />
      </div>
      <ul className="divide-y divide-line">
        {athletes.map((athlete) => {
          const summary = summaries.get(athlete.id);
          const age = format(t.athleteProfile.ageValue, { years: ageOn(athlete.birth_date, today) });
          const account = athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount;
          const recordings = summary ? format(t.coach.recordings, { count: summary.stats.total }) : t.coach.noRecordings;
          return (
            <li key={athlete.id}>
              <Link
                href={coachAthletePath(athlete.id)}
                className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 px-4 py-3 text-ink transition-colors duration-fast hover:bg-sunken hover:no-underline md:min-h-16 ${COLUMNS}`}
                aria-label={format(t.coach.openAthlete, { name: athlete.display_name })}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} />
                  <span className="grid min-w-0">
                    <span className="truncate font-semibold">{athlete.display_name}</span>
                    {/* Celular: los datos de las columnas en una segunda línea */}
                    <span className="flex flex-wrap gap-x-3 text-sm text-ink-muted md:hidden">
                      <span>{age}</span>
                      <span>{account}</span>
                      <span>{recordings}</span>
                    </span>
                  </span>
                </span>
                <span className="hidden text-sm tabular-nums text-ink-muted md:block">{age}</span>
                <span className="hidden text-sm text-ink-muted md:block">{account}</span>
                <span className="hidden text-sm tabular-nums text-ink-muted md:block">{recordings}</span>
                <span className="justify-self-end md:justify-self-start">
                  {summary?.latestScore != null ? <RiskBadge score={summary.latestScore} /> : <span className="text-sm text-ink-muted">-</span>}
                </span>
                <span className="hidden text-line-strong transition-colors group-hover:text-accent md:block">
                  <Icon name="chevronRight" size={18} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
