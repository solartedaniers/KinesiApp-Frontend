import Link from "next/link";

import { EmptyState } from "@/components/app/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { teamPath } from "@/lib/routes";
import type { Team } from "@/lib/types";

const styles = {
  grid: "divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel",
  card: "group flex items-center gap-3 px-4 py-3 text-ink transition-colors duration-fast hover:bg-sunken hover:no-underline [&>svg:last-child]:text-line-strong group-hover:[&>svg:last-child]:text-accent",
  cardIcon: "grid size-10 flex-none place-items-center rounded-control bg-sunken text-ink-muted group-hover:text-accent",
  cardText: "grid min-w-0 flex-1",
  cardTitle: "font-semibold [overflow-wrap:anywhere]",
  meta: "flex flex-wrap gap-x-3 text-sm font-normal text-ink-muted",
};

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
                <span>{format(t.teams.members, { count: team.athlete_ids.length })}</span>
                {ownerNames && <span>{ownerNames.get(team.owner_id) ?? t.teams.unknownOwner}</span>}
              </span>
            </span>
            <Icon name="chevronRight" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
