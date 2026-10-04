import Link from "next/link";

import { EmptyState } from "@/components/app/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { teamPath } from "@/lib/routes";
import type { Team } from "@/lib/types";

import styles from "./Teams.module.css";

/** Tarjetas de equipos con su cantidad de deportistas; el admin ve también de quién es cada uno. */
export async function TeamsList({
  teams,
  section,
  ownerNames,
}: {
  teams: Team[];
  section: "coach" | "admin";
  ownerNames?: Map<number, string>;
}) {
  const t = await getT();
  if (teams.length === 0) return <EmptyState icon="folder" title={t.teams.empty} body={t.teams.emptyHint} />;

  return (
    <ul className={styles.grid}>
      {teams.map((team) => (
        <li key={team.id}>
          <Link href={teamPath(section, team.id)} className={styles.card}>
            <span className={styles.cardIcon}>
              <Icon name="folder" />
            </span>
            <span className={styles.cardText}>
              <span className={styles.cardTitle}>{team.name}</span>
              <span className={styles.meta}>
                {format(t.teams.members, { count: team.athlete_ids.length })}
                {ownerNames && ` · ${ownerNames.get(team.owner_id) ?? t.teams.unknownOwner}`}
              </span>
            </span>
            <Icon name="chevronRight" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
