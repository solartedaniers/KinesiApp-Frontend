import type { Metadata } from "next";
import { Suspense } from "react";

import { PageIntro } from "@/components/app/PageIntro";
import { CoachAthletesList } from "@/components/coach/CoachData";
import { ButtonLink } from "@/components/instrument/Button";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.athletes };
}

export default async function CoachAthletesPage() {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  return (
    <>
      <PageIntro
        title={t.nav.athletes}
        lead={t.coach.athletesLead}
        action={<ButtonLink href={ROUTES.newCoachAthlete} glyph="plus" className="max-sm:w-full">{t.coach.newAthlete}</ButtonLink>}
      />
      <Suspense fallback={<LoadingState label={t.coachHome.loading} />}>
        <CoachAthletesList />
      </Suspense>
    </>
  );
}
