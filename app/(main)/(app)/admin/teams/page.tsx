import type { Metadata } from "next";

import { TeamsScreen } from "@/components/teams/TeamScreens";
import { SECTION_ROLES } from "@/lib/access";
import { listUsers } from "@/lib/data/admin";
import { listTeams } from "@/lib/data/teams";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.teams };
}

// El admin ve todos los equipos, con el nombre de quien los creó
export default async function AdminTeamsPage() {
  await requireRole(SECTION_ROLES.admin);
  const [teams, users] = await Promise.all([listTeams(), listUsers()]);
  return <TeamsScreen section="admin" teams={teams} ownerNames={new Map(users.map((user) => [user.id, user.full_name]))} />;
}
