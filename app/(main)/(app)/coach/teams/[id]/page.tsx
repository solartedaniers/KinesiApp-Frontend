import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LoadingState } from "@/components/instrument/States";
import { CoachTeamBody, TeamHeader } from "@/components/teams/TeamScreens";
import { SECTION_ROLES } from "@/lib/access";
import { listMyAthletes } from "@/lib/data/coach";
import { getTeam } from "@/lib/data/teams";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { parseId } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/coach/teams/[id]">): Promise<Metadata> {
  const t = await getT();
  const teamId = parseId((await params).id);
  return { title: teamId ? (await getTeam(teamId)).name : t.nav.teams };
}

// SSR con streaming: el encabezado sale primero; deportistas, estadísticas y análisis del equipo después.
// El coach agrupa a cualquiera de sus deportistas, con cuenta o gestionados
export default async function CoachTeamPage({ params }: PageProps<"/coach/teams/[id]">) {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  const teamId = parseId((await params).id);
  if (!teamId) notFound();
  const [team, athletes] = await Promise.all([getTeam(teamId), listMyAthletes()]);
  return (
    <>
      <TeamHeader section="coach" team={team} />
      <Suspense fallback={<LoadingState label={t.teams.loading} />}>
        <CoachTeamBody team={team} candidates={athletes} />
      </Suspense>
    </>
  );
}
