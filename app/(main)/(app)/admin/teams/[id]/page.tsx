import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TeamHeader, TeamMembers } from "@/components/teams/TeamScreens";
import { SECTION_ROLES } from "@/lib/access";
import { listAllAthletes, listUsers } from "@/lib/data/admin";
import { getTeam } from "@/lib/data/teams";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { parseId } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/admin/teams/[id]">): Promise<Metadata> {
  const t = await getT();
  const teamId = parseId((await params).id);
  return { title: teamId ? (await getTeam(teamId)).name : t.nav.teams };
}

// Mismas reglas que el backend: en el equipo de un coach sólo sus deportistas; en uno de admin, todos.
// Sin estadísticas: ListCoachedAnalyses es sólo del coach
export default async function AdminTeamPage({ params }: PageProps<"/admin/teams/[id]">) {
  await requireRole(SECTION_ROLES.admin);
  const teamId = parseId((await params).id);
  if (!teamId) notFound();
  const [team, users, athletes] = await Promise.all([getTeam(teamId), listUsers(), listAllAthletes()]);
  const owner = users.find((user) => user.id === team.owner_id);
  const candidates = owner?.role === "admin" ? athletes : athletes.filter((athlete) => athlete.coach_id === team.owner_id);
  return (
    <>
      <TeamHeader section="admin" team={team} ownerName={owner?.full_name} />
      <TeamMembers section="admin" team={team} candidates={candidates} />
    </>
  );
}
