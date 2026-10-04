import type { Metadata } from "next";

import { TeamsScreen } from "@/components/teams/TeamScreens";
import { SECTION_ROLES } from "@/lib/access";
import { listTeams } from "@/lib/data/teams";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.teams };
}

export default async function CoachTeamsPage() {
  await requireRole(SECTION_ROLES.coach);
  return <TeamsScreen section="coach" teams={await listTeams()} />;
}
