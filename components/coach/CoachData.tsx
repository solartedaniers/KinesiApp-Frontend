import Link from "next/link";

import { AnalysisList } from "@/components/analysis/AnalysisList";
import { RiskDial } from "@/components/analysis/RiskDial";
import { RiskInstruments } from "@/components/analysis/RiskInstruments";
import { ButtonLink } from "@/components/instrument/Button";
import { CountUp } from "@/components/instrument/CountUp";
import { EmptyState } from "@/components/instrument/States";
import { TeamEmblem } from "@/components/teams/TeamEmblem";
import { TeamsList } from "@/components/teams/TeamsList";
import { type AthleteSummary, riskLevel, statsByAthlete } from "@/lib/analysis-stats";
import { getRiskCuts } from "@/lib/data/public";
import { cssVars } from "@/lib/design/css";
import { RISK_DIAL_MAX, RISK_TONE } from "@/lib/design/risk";
import { listAnalysesByAthlete } from "@/lib/data/analyses";
import { listMyAthletes, listTeamAnalyses } from "@/lib/data/coach";
import { listTeams } from "@/lib/data/teams";
import { plural } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { NAV_BY_ROLE } from "@/lib/access";
import { ROUTES, teamPath, teamsPath, teamStatsPath } from "@/lib/routes";
import { findTeam, scopeToTeam, statsByTeam } from "@/lib/team-stats";
import type { AthleteProfile } from "@/lib/types";

import { AthleteRoster } from "./AthleteRoster";

// Async Server Components que cada página del coach envuelve en <Suspense>: el encabezado sale de
// inmediato y estos bloques llegan después, en otro chunk del mismo stream HTTP

const ATTENTION_COUNT = 4;
const RECENT_COUNT = 5;
const card = "kin-card grid content-start gap-5 p-5 sm:p-6";
const sectionTitle = "font-display text-xl font-semibold text-ink";
const navHref = (key: string) => NAV_BY_ROLE.coach.find((item) => item.key === key)!.href;

/** Ambas peticiones salen en el mismo tick y se esperan juntas, no una detrás de otra. */
async function teamData() {
  const [athletes, analyses, cuts] = await Promise.all([listMyAthletes(), listTeamAnalyses(), getRiskCuts()]);
  return { athletes, analyses, cuts, summaries: statsByAthlete(analyses, cuts) };
}

const latestScore = (summaries: Map<string, AthleteSummary>, athlete: AthleteProfile) => summaries.get(athlete.id)?.latestScore ?? null;

/** Del riesgo más alto al más bajo; los que no tienen análisis, al final. */
function byLatestRisk(athletes: AthleteProfile[], summaries: Map<string, AthleteSummary>): AthleteProfile[] {
  return [...athletes].sort((a, b) => (latestScore(summaries, b) ?? -1) - (latestScore(summaries, a) ?? -1));
}

/** Últimos puntajes de cada deportista con análisis procesados. */
function latestScores(athletes: AthleteProfile[], summaries: Map<string, AthleteSummary>): number[] {
  return athletes.flatMap((athlete) => {
    const score = latestScore(summaries, athlete);
    return score === null ? [] : [score];
  });
}

function SeeAll({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="text-sm font-semibold">{label}</Link>;
}

/** Frase de bienvenida: cuántos deportistas terminaron su último análisis con riesgo alto. */
export async function CoachLead() {
  const t = await getT();
  const l = t.coachHome.lead;
  const { athletes, summaries, cuts } = await teamData();
  const scores = latestScores(athletes, summaries);
  const high = scores.filter((score) => score >= cuts.high).length;
  const text = athletes.length === 0 ? l.noAthletes : scores.length === 0 ? l.noAnalyses : high ? plural(l.high, high, { total: athletes.length }) : plural(l.none, athletes.length);
  return <p className="max-w-prose text-lg text-ink-muted">{text}</p>;
}

/** Inicio del coach: medidor del plantel, a quién mirar primero, sus equipos y lo último que se grabó. */
export async function CoachOverview() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const h = t.coachHome;
  const [{ athletes, analyses, summaries, cuts }, teams] = await Promise.all([teamData(), listTeams()]);
  if (athletes.length === 0) {
    return <EmptyState title={t.coach.rosterEmpty} body={t.coach.rosterEmptyHint} action={<ButtonLink href={ROUTES.newCoachAthlete} glyph="plus">{t.coach.newAthlete}</ButtonLink>} />;
  }
  const scores = latestScores(athletes, summaries);
  const squad = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
  const level = squad === null ? null : riskLevel(squad, cuts);
  const counts = [
    { label: t.coach.athletesCount, value: athletes.length },
    { label: t.stats.recordings, value: analyses.length },
    { label: h.highNow, value: scores.filter((score) => score >= cuts.high).length },
  ];
  const names = new Map(athletes.map((athlete) => [athlete.id, athlete.display_name]));
  const teamStats = new Map(statsByTeam(teams, analyses, cuts).map(({ team, stats }) => [team.id, stats]));

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="home-squad" className={`${card} kin-tinted`} style={cssVars({ "--tint": level ? RISK_TONE[level].tint : "var(--kin-line-strong)" })}>
          <div className="grid gap-1">
            <h2 id="home-squad" className={sectionTitle}>{h.squad}</h2>
            <p className="text-sm text-ink-muted">{h.squadLead}</p>
          </div>
          <RiskDial
            score={squad}
            cuts={cuts}
            label={squad === null || !level ? h.squadEmpty : `${h.squad}: ${f.percent(squad)}, ${t.analysis.risk[level]}`}
            className="mx-auto w-full max-w-[16rem]"
          >
            {squad !== null && level ? (
              <>
                <CountUp value={squad * RISK_DIAL_MAX} text={f.percent(squad)} className={`font-display text-3xl font-bold ${RISK_TONE[level].text}`} />
                <span className="text-sm font-semibold text-ink-muted">{t.analysis.riskShort[level]}</span>
              </>
            ) : (
              <span className="px-6 text-sm text-ink-muted">{h.squadEmpty}</span>
            )}
          </RiskDial>
          <dl className="grid grid-cols-3 gap-3">
            {counts.map((count, i) => (
              <div key={count.label} className="kin-well grid gap-1 p-3">
                <dt className="text-xs text-ink-muted">{count.label}</dt>
                <dd className="font-display text-3xl font-semibold text-ink"><CountUp value={count.value} text={String(count.value)} delayMs={i * 90} /></dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="home-attention" className="grid content-start gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 id="home-attention" className={sectionTitle}>{h.attention}</h2>
            {athletes.length > ATTENTION_COUNT && <SeeAll href={ROUTES.coachAthletes} label={h.seeAllAthletes} />}
          </div>
          <p className="-mt-2 text-sm text-ink-muted">{h.attentionLead}</p>
          <AthleteRoster athletes={byLatestRisk(athletes, summaries).slice(0, ATTENTION_COUNT)} summaries={summaries} empty={null} />
        </section>
      </div>

      <section aria-labelledby="home-teams" className="grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 id="home-teams" className={sectionTitle}>{h.teams}</h2>
          <SeeAll href={teamsPath("coach")} label={teams.length ? h.seeAllTeams : h.createTeam} />
        </div>
        {teams.length > 0 ? (
          <ul className="flex snap-x gap-3 overflow-x-auto pb-2">
            {teams.map((team) => {
              const average = teamStats.get(team.id)?.averageRisk ?? null;
              return (
                <li key={team.id} className="snap-start">
                  <Link href={teamPath("coach", team.id)} className="kin-card flex w-64 items-center gap-3 p-3 text-ink hover:no-underline">
                    <TeamEmblem team={team} />
                    <span className="grid min-w-0">
                      <span className="truncate font-display font-semibold">{team.name}</span>
                      <span className="text-sm text-ink-muted">{plural(t.teams.members, team.athlete_ids.length)}</span>
                    </span>
                    {average !== null && <span className={`ml-auto font-display text-lg font-semibold ${RISK_TONE[riskLevel(average, cuts)].text}`}>{f.percent(average)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">{h.noTeams}</p>
        )}
      </section>

      <section aria-labelledby="home-recent" className="grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 id="home-recent" className={sectionTitle}>{h.recent}</h2>
          {analyses.length > RECENT_COUNT && <SeeAll href={navHref("analyses")} label={h.seeAllAnalyses} />}
        </div>
        <AnalysisList analyses={analyses.slice(0, RECENT_COUNT)} subtitleFor={(analysis) => names.get(analysis.athlete_id)} />
      </section>
    </>
  );
}

/** Todos los deportistas del coach con su último riesgo (página Deportistas). */
export async function CoachAthletesList() {
  const t = await getT();
  const { athletes, summaries } = await teamData();
  return (
    <AthleteRoster
      athletes={athletes}
      summaries={summaries}
      empty={<EmptyState title={t.coach.rosterEmpty} body={t.coach.rosterEmptyHint} action={<ButtonLink href={ROUTES.newCoachAthlete} glyph="plus">{t.coach.newAthlete}</ButtonLink>} />}
    />
  );
}

export async function TeamAnalyses() {
  const { athletes, analyses } = await teamData();
  const names = new Map(athletes.map((athlete) => [athlete.id, athlete.display_name]));
  return <AnalysisList analyses={analyses} subtitleFor={(analysis) => names.get(analysis.athlete_id)} />;
}

/** Estadísticas del coach, de todos sus deportistas o de un equipo (`?team=`), con los instrumentos de la guía. */
export async function TeamStats({ teamParam }: { teamParam?: string | string[] }) {
  const t = await getT();
  const [{ athletes: allAthletes, analyses: allAnalyses, cuts }, teams] = await Promise.all([teamData(), listTeams()]);
  const team = findTeam(teams, teamParam);
  const { athletes, analyses } = scopeToTeam(allAthletes, allAnalyses, team);
  const summaries = statsByAthlete(analyses, cuts);
  const chip = "kin-well inline-flex min-h-11 items-center gap-2 rounded-full py-1 pr-4 pl-1.5 text-sm font-semibold text-ink hover:no-underline hover:text-accent aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent";
  return (
    <>
      {teams.length > 0 && (
        <nav aria-label={t.teams.filterLabel}>
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href={navHref("stats")} aria-current={team ? undefined : "page"} className={`${chip} pl-4`}>{t.teams.allAthletes}</Link>
            </li>
            {teams.map((group) => (
              <li key={group.id}>
                <Link href={teamStatsPath(group.id)} aria-current={group.id === team?.id ? "page" : undefined} className={chip}>
                  <TeamEmblem team={group} size="sm" />
                  {group.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <RiskInstruments analyses={analyses} voice="group" leading={[{ label: t.coach.athletesCount, value: athletes.length }]} />
      <section aria-labelledby="stats-athletes" className="grid gap-3">
        <div className="grid gap-1">
          <h2 id="stats-athletes" className={sectionTitle}>{t.coach.byRiskTitle}</h2>
          <p className="text-sm text-ink-muted">{t.coach.byRiskLead}</p>
        </div>
        <AthleteRoster athletes={byLatestRisk(athletes, summaries)} summaries={summaries} empty={<EmptyState title={t.coach.rosterEmpty} body={t.teams.membersEmptyHint} />} />
      </section>
      {/* Sin filtro, además, la comparación entre equipos */}
      {!team && teams.length > 0 && (
        <section aria-labelledby="stats-teams" className="grid gap-3">
          <div className="grid gap-1">
            <h2 id="stats-teams" className={sectionTitle}>{t.teams.byTeamTitle}</h2>
            <p className="text-sm text-ink-muted">{t.teams.byTeamSubtitle}</p>
          </div>
          <TeamsList teams={teams} section="coach" stats={new Map(statsByTeam(teams, allAnalyses, cuts).map(({ team: group, stats }) => [group.id, stats]))} />
        </section>
      )}
    </>
  );
}

/** Instrumentos y grabaciones de un deportista del coach (la ficha ya se validó en la página). */
export async function CoachAthleteRecordings({ athleteId }: { athleteId: string }) {
  const t = await getT();
  const analyses = await listAnalysesByAthlete(athleteId);
  return (
    <>
      <RiskInstruments analyses={analyses} voice="group" />
      <section aria-labelledby="athlete-recordings" className="grid gap-3">
        <h2 id="athlete-recordings" className={sectionTitle}>{t.coach.recordingsTitle}</h2>
        <AnalysisList analyses={analyses} />
      </section>
    </>
  );
}
