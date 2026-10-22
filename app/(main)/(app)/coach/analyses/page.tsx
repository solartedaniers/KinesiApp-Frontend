import type { Metadata } from "next";
import { Suspense } from "react";

import { PageIntro } from "@/components/app/PageIntro";
import { TeamAnalyses } from "@/components/coach/CoachData";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.analyses };
}

// SSR con streaming: la consulta más pesada del coach, detrás del encabezado
export default async function Page() {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  return (
    <>
      <PageIntro title={t.nav.analyses} lead={t.coach.analysesLead} />
      <Suspense fallback={<LoadingState label={t.coach.analysesLoading} />}>
        <TeamAnalyses />
      </Suspense>
    </>
  );
}
