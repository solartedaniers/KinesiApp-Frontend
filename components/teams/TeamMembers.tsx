import { Avatar } from "@/components/app/Avatar";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { setTeamMember } from "@/lib/actions/teams";
import { getT } from "@/lib/i18n/server";
import type { AthleteProfile, Team } from "@/lib/types";

import styles from "./Teams.module.css";

/**
 * Deportistas que pueden estar en el equipo, con un botón para agregarlos o quitarlos. Cada botón
 * es un <form> con su Server Action ligada: funciona sin JavaScript.
 */
export async function TeamMembers({ team, candidates }: { team: Team; candidates: AthleteProfile[] }) {
  const t = await getT();
  if (candidates.length === 0) return <EmptyState icon="users" title={t.teams.noCandidates} body={t.teams.noCandidatesHint} />;
  const members = new Set(team.athlete_ids);
  // Primero los miembros, después el resto; cada grupo por nombre (ya viene ordenado)
  const ordered = [...candidates].sort((a, b) => Number(members.has(b.id)) - Number(members.has(a.id)));

  return (
    <ul className={styles.members}>
      {ordered.map((athlete) => {
        const isMember = members.has(athlete.id);
        return (
          <li key={athlete.id} className={styles.memberRow}>
            <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} />
            <span className={styles.cardText}>
              <span className={styles.cardTitle}>{athlete.display_name}</span>
              <span className={styles.meta}>{athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount}</span>
            </span>
            <form action={setTeamMember.bind(null, team.id, athlete.id, !isMember)}>
              <Button type="submit" variant={isMember ? "ghost" : "secondary"}>
                <Icon name={isMember ? "close" : "plus"} size={16} />
                {isMember ? t.teams.removeMember : t.teams.addMember}
              </Button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
