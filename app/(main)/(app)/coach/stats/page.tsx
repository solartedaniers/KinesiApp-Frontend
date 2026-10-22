import type { Metadata } from "next";
import { Suspense } from "react";

import { PageIntro } from "@/components/app/PageIntro";
import { TeamStats } from "@/components/coach/CoachData";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { TEAM_PARAM } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.stats };
}

// SSR con streaming: los instrumentos se calculan en el servidor, de todos o de un equipo (?team=)
export default async function Page({ searchParams }: PageProps<"/coach/stats">) {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  return (
    <>
      <PageIntro title={t.nav.stats} lead={t.coach.statsLead} />
      <Suspense fallback={<LoadingState label={t.coach.statsLoading} />}>
        <TeamStats teamParam={(await searchParams)[TEAM_PARAM]} />
      </Suspense>
    </>
  );
}
