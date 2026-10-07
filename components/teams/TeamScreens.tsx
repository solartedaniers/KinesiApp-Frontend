import Link from "next/link";

import { pageStyles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { Section } from "@/components/app/Section";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { createTeam, deleteTeam, renameTeam } from "@/lib/actions/teams";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { teamsPath } from "@/lib/routes";
import type { AthleteProfile, Team } from "@/lib/types";

import { TeamMembers } from "./TeamMembers";
import { TeamNameForm } from "./TeamNameForm";
import { TeamsList } from "./TeamsList";

type TeamSection = "coach" | "admin";

/** Lista de equipos + alta, la misma para el coach (sus equipos) y el admin (todos). */
export async function TeamsScreen({ section, teams, ownerNames }: { section: TeamSection; teams: Team[]; ownerNames?: Map<number, string> }) {
  const t = await getT();
  return (
    <div className={pageStyles.page}>
      <PageHeader title={t.nav.teams} subtitle={section === "coach" ? t.teams.coachSubtitle : t.teams.adminSubtitle} />
      <section className={`${pageStyles.card} ${pageStyles.narrow}`} aria-labelledby="new-team">
        <h2 id="new-team" className={pageStyles.sectionTitle}>
          {t.teams.newTeam}
        </h2>
        <TeamNameForm action={createTeam.bind(null, section)} submitLabel={t.teams.create} />
      </section>
      <TeamsList teams={teams} section={section} ownerNames={ownerNames} />
    </div>
  );
}

/** Un equipo: renombrar, asignar deportistas y borrar. `statsHref` sólo para el coach. */
export async function TeamDetailScreen({
  section,
  team,
  candidates,
  ownerName,
  statsHref,
}: {
  section: TeamSection;
  team: Team;
  candidates: AthleteProfile[];
  ownerName?: string;
  statsHref?: string;
}) {
  const t = await getT();
  return (
    <div className={pageStyles.page}>
      <Link href={teamsPath(section)} className={pageStyles.backLink}>
        <Icon name="chevronRight" size={16} />
        {t.teams.back}
      </Link>
      <PageHeader
        title={team.name}
        subtitle={ownerName ? format(t.teams.ownedBy, { name: ownerName }) : format(t.teams.members, { count: team.athlete_ids.length })}
      />
      <div className={pageStyles.actions}>
        {statsHref && (
          <ButtonLink href={statsHref} variant="secondary">
            <Icon name="chart" size={18} />
            {t.teams.viewStats}
          </ButtonLink>
        )}
        <ConfirmDialog
          triggerLabel={t.teams.delete}
          title={format(t.teams.deleteTitle, { name: team.name })}
          body={t.teams.deleteBody}
          confirmLabel={t.common.delete}
          action={deleteTeam.bind(null, section, team.id)}
        />
      </div>
      <section className={`${pageStyles.card} ${pageStyles.narrow}`} aria-labelledby="rename-team">
        <h2 id="rename-team" className={pageStyles.sectionTitle}>
          {t.teams.rename}
        </h2>
        <TeamNameForm action={renameTeam.bind(null, team.id)} defaultName={team.name} submitLabel={t.common.save} />
      </section>
      <Section title={t.teams.athletes}>
        <p className={pageStyles.subtitle}>{section === "coach" ? t.teams.coachCandidatesHint : t.teams.adminCandidatesHint}</p>
        <TeamMembers team={team} candidates={candidates} />
      </Section>
    </div>
  );
}
