import type { Metadata } from "next";
import { Suspense } from "react";

import { PageIntro } from "@/components/app/PageIntro";
import { CoachLead, CoachOverview } from "@/components/coach/CoachData";
import { ButtonLink } from "@/components/instrument/Button";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { firstName } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.home };
}

// SSR con streaming: el saludo sale con el primer chunk; la frase, el plantel y los equipos después
export default async function CoachHomePage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.coach);
  return (
    <>
      <PageIntro
        title={format(t.home.greeting, { name: firstName(user.full_name) })}
        lead={
          <Suspense fallback={<p className="max-w-prose text-lg text-ink-muted">{t.home.coach}</p>}>
            <CoachLead />
          </Suspense>
        }
        action={<ButtonLink href={ROUTES.newCoachAthlete} glyph="plus" className="max-sm:w-full">{t.coach.newAthlete}</ButtonLink>}
      />
      <Suspense fallback={<LoadingState label={t.coachHome.loading} />}>
        <CoachOverview />
      </Suspense>
    </>
  );
}
