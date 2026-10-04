import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TeamDetailScreen } from "@/components/teams/TeamScreens";
import { SECTION_ROLES } from "@/lib/access";
import { listAllAthletes, listUsers } from "@/lib/data/admin";
import { getTeam } from "@/lib/data/teams";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.teams };
}

// Mismas reglas que el backend: en el equipo de un coach sólo sus deportistas; en uno de admin, todos
export default async function AdminTeamPage({ params }: PageProps<"/admin/teams/[id]">) {
  await requireRole(SECTION_ROLES.admin);
  const teamId = Number((await params).id);
  if (!Number.isInteger(teamId) || teamId <= 0) notFound();
  const [team, users, athletes] = await Promise.all([getTeam(teamId), listUsers(), listAllAthletes()]);
  const owner = users.find((user) => user.id === team.owner_id);
  const candidates = owner?.role === "admin" ? athletes : athletes.filter((athlete) => athlete.coach_id === team.owner_id);
  return <TeamDetailScreen section="admin" team={team} candidates={candidates} ownerName={owner?.full_name} />;
}
