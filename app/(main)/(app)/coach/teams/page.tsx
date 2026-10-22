import type { Metadata } from "next";

import { TeamsScreen } from "@/components/teams/TeamScreens";
import { SECTION_ROLES } from "@/lib/access";
import { listTeamAnalyses } from "@/lib/data/coach";
import { listTeams } from "@/lib/data/teams";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.teams };
}

export default async function CoachTeamsPage() {
  await requireRole(SECTION_ROLES.coach);
  const [teams, analyses] = await Promise.all([listTeams(), listTeamAnalyses()]);
  return <TeamsScreen section="coach" teams={teams} analyses={analyses} />;
}
