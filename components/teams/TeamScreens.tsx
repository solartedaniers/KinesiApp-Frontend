import Link from "next/link";

import { AnalysisList } from "@/components/analysis/AnalysisList";
import { RiskInstruments } from "@/components/analysis/RiskInstruments";
import { AvatarEditor } from "@/components/AvatarEditor";
import { Avatar } from "@/components/app/Avatar";
import { AthleteRoster } from "@/components/coach/AthleteRoster";
import { Button, ButtonLink } from "@/components/instrument/Button";
import { ConfirmDialog } from "@/components/instrument/Dialog";
import { Glyph } from "@/components/instrument/Glyph";
import { EmptyState } from "@/components/instrument/States";
import { createTeam, confirmTeamLogoUpload, deleteTeam, removeTeamLogo, renameTeam, setTeamMember, startTeamLogoUpload } from "@/lib/actions/teams";
import { statsByAthlete } from "@/lib/analysis-stats";
import { getRiskCuts } from "@/lib/data/public";
import { cssVars } from "@/lib/design/css";
import { listTeamAnalyses } from "@/lib/data/coach";
import { format, plural } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { newAnalysisPath, teamsPath } from "@/lib/routes";
import { statsByTeam } from "@/lib/team-stats";
import type { AthleteProfile, AnalysisSummary, Team } from "@/lib/types";

import { TeamEmblem, teamSignal } from "./TeamEmblem";
import { TeamNameForm } from "./TeamNameForm";
import { TeamNameHeading } from "./TeamNameHeading";
import { TeamsList } from "./TeamsList";

type TeamSection = "coach" | "admin";

const RECENT_COUNT = 5;
const card = "kin-card grid content-start gap-5 p-5 sm:p-6";
const sectionTitle = "font-display text-xl font-semibold text-ink";

/** Lista de equipos + alta, la misma para el coach (sus equipos, con su riesgo) y el admin (todos, con su dueño). */
export async function TeamsScreen({ section, teams, analyses, ownerNames }: { section: TeamSection; teams: Team[]; analyses?: AnalysisSummary[]; ownerNames?: Map<string, string> }) {
  const [t, cuts] = await Promise.all([getT(), getRiskCuts()]);
  const stats = analyses && new Map(statsByTeam(teams, analyses, cuts).map(({ team, stats: teamStats }) => [team.id, teamStats]));
  return (
    <>
      <section aria-labelledby="teams-title" className="grid gap-2">
        <h1 id="teams-title" className="font-display text-hero font-bold tracking-tight text-ink">{t.nav.teams}</h1>
        <p className="max-w-prose text-lg text-ink-muted">{section === "coach" ? t.teams.coachSubtitle : t.teams.adminSubtitle}</p>
      </section>
      <section aria-labelledby="new-team" className={`${card} max-w-2xl`}>
        <h2 id="new-team" className={sectionTitle}>{t.teams.newTeam}</h2>
        <TeamNameForm action={createTeam.bind(null, section)} />
      </section>
      <TeamsList teams={teams} section={section} stats={stats} ownerNames={ownerNames} />
    </>
  );
}

/**
 * Encabezado del equipo: logo o emblema (con su editor), el nombre grande editable en su lugar y el
 * borrado. Sale con el primer chunk; deportistas y estadísticas llegan después.
 */
export async function TeamHeader({ section, team, ownerName }: { section: TeamSection; team: Team; ownerName?: string }) {
  const t = await getT();
  const id = team.id;
  return (
    <>
      <Link href={teamsPath(section)} className="inline-flex w-fit items-center gap-1 text-sm font-semibold">
        <Glyph name="chevronLeft" size={16} />
        {t.teams.back}
      </Link>
      <section aria-labelledby="team-title" className="kin-card kin-tinted grid justify-items-center gap-4 px-5 py-8 text-center sm:px-8" style={cssVars({ "--tint": `var(--kin-${teamSignal(id)})` })}>
        <AvatarEditor
          stacked
          name={team.name}
          imageUrl={team.logo_url}
          preview={<TeamEmblem team={team} size="lg" />}
          labels={t.teams.logo}
          start={startTeamLogoUpload.bind(null, id)}
          confirm={confirmTeamLogoUpload.bind(null, id)}
          remove={removeTeamLogo.bind(null, id)}
        />
        <TeamNameHeading name={team.name} action={renameTeam.bind(null, id)} />
        <p className="flex flex-wrap justify-center gap-x-3 text-ink-muted">
          <span>{plural(t.teams.members, team.athlete_ids.length)}</span>
          {ownerName && <span>{format(t.teams.ownedBy, { name: ownerName })}</span>}
        </p>
        <ConfirmDialog
          labels={{ open: t.teams.delete, title: format(t.teams.deleteTitle, { name: team.name }), body: t.teams.deleteBody, confirm: t.common.delete, cancel: t.common.cancel }}
          action={deleteTeam.bind(null, section, id)}
        />
      </section>
    </>
  );
}

/** Agregar (`member`) o quitar: un <form> con su Server Action ligada, funciona sin JavaScript. */
async function MemberButton({ team, athlete, member }: { team: Team; athlete: AthleteProfile; member: boolean }) {
  const t = await getT();
  return (
    <form action={setTeamMember.bind(null, team.id, athlete.id, member)}>
      <Button type="submit" variant={member ? "secondary" : "quiet"} glyph={member ? "plus" : "close"} aria-label={format(member ? t.teams.addMemberLabel : t.teams.removeMemberLabel, { name: athlete.display_name })}>
        {member ? t.teams.addMember : t.teams.removeMember}
      </Button>
    </form>
  );
}

/**
 * Deportistas del equipo con su mini medidor y, aparte, los que se pueden sumar. El coach graba o sube
 * video sólo para sus gestionados: a los que tienen cuenta propia les toca grabar desde su cuenta.
 */
export async function TeamMembers({ section, team, candidates, analyses }: { section: TeamSection; team: Team; candidates: AthleteProfile[]; analyses?: AnalysisSummary[] }) {
  const [t, cuts] = await Promise.all([getT(), getRiskCuts()]);
  const ids = new Set(team.athlete_ids);
  const members = candidates.filter((athlete) => ids.has(athlete.id));
  const others = candidates.filter((athlete) => !ids.has(athlete.id));
  const summaries = analyses && statsByAthlete(analyses, cuts);
  // En el equipo, los de riesgo más alto primero: son los que el coach tiene que mirar
  if (summaries) members.sort((a, b) => (summaries.get(b.id)?.latestScore ?? -1) - (summaries.get(a.id)?.latestScore ?? -1));

  return (
    <>
      <section aria-labelledby="team-members" className="grid gap-3">
        <div className="grid gap-1">
          <h2 id="team-members" className={sectionTitle}>{t.teams.athletes}</h2>
          <p className="text-sm text-ink-muted">{section === "coach" ? t.teams.coachCandidatesHint : t.teams.adminCandidatesHint}</p>
        </div>
        <AthleteRoster
          athletes={members}
          summaries={summaries}
          empty={<EmptyState title={t.teams.membersEmpty} body={others.length ? t.teams.membersEmptyHint : t.teams.noCandidatesHint} />}
          actions={(athlete) => (
            <>
              {section === "coach" &&
                (athlete.is_managed ? (
                  <ButtonLink href={newAnalysisPath(athlete.id)} variant="secondary" glyph="capture" aria-label={format(t.teams.recordFor, { name: athlete.display_name })}>{t.teams.record}</ButtonLink>
                ) : (
                  <span className="self-center text-xs text-ink-muted">{t.teams.recordOwn}</span>
                ))}
              <MemberButton team={team} athlete={athlete} member={false} />
            </>
          )}
        />
      </section>

      <section aria-labelledby="team-add" className={card}>
        <h2 id="team-add" className={sectionTitle}>{t.teams.addTitle}</h2>
        {others.length === 0 ? (
          <p className="text-sm text-ink-muted">{candidates.length ? t.teams.allIn : t.teams.noCandidates}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {others.map((athlete) => (
              <li key={athlete.id} className="kin-well flex items-center gap-3 p-2.5 pl-3">
                <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate font-semibold text-ink">{athlete.display_name}</span>
                  <span className="text-xs text-ink-muted">{athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount}</span>
                </span>
                <MemberButton team={team} athlete={athlete} member />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Miembros y estadísticas del equipo desde el coach: una sola lectura de sus análisis, filtrada por `team_id` en el backend. */
export async function CoachTeamBody({ team, candidates }: { team: Team; candidates: AthleteProfile[] }) {
  const t = await getT();
  const analyses = await listTeamAnalyses(team.id);
  const names = new Map(candidates.map((athlete) => [athlete.id, athlete.display_name]));
  return (
    <>
      <TeamMembers section="coach" team={team} candidates={candidates} analyses={analyses} />
      <section aria-labelledby="team-stats" className="grid gap-6">
        <h2 id="team-stats" className="font-display text-2xl font-semibold text-ink">{t.teams.statsTitle}</h2>
        <RiskInstruments analyses={analyses} voice="group" leading={[{ label: t.coach.athletesCount, value: team.athlete_ids.length }]} />
      </section>
      <section aria-labelledby="team-recent" className="grid gap-3">
        <h2 id="team-recent" className={sectionTitle}>{t.teams.recentTitle}</h2>
        <AnalysisList analyses={analyses.slice(0, RECENT_COUNT)} subtitleFor={(analysis) => names.get(analysis.athlete_id)} />
      </section>
    </>
  );
}
