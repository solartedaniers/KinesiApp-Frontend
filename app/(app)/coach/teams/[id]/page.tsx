import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TeamDetailScreen } from "@/components/teams/TeamScreens";
import { SECTION_ROLES } from "@/lib/access";
import { listMyAthletes } from "@/lib/data/coach";
import { getTeam } from "@/lib/data/teams";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { teamStatsPath } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.teams };
}

// El coach agrupa a cualquiera de sus deportistas, con cuenta o gestionados
export default async function CoachTeamPage({ params }: PageProps<"/coach/teams/[id]">) {
  await requireRole(SECTION_ROLES.coach);
  const teamId = Number((await params).id);
  if (!Number.isInteger(teamId) || teamId <= 0) notFound();
  const [team, athletes] = await Promise.all([getTeam(teamId), listMyAthletes()]);
  return <TeamDetailScreen section="coach" team={team} candidates={athletes} statsHref={teamStatsPath(team.id)} />;
}
