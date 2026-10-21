import type { Metadata } from "next";
import { Suspense } from "react";

import { AthleteLead, AthleteOverview } from "@/components/athlete/AthleteData";
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

// SSR con streaming: el saludo sale con el primer chunk; la frase, el último análisis y la tendencia después
export default async function AthleteHomePage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.athlete);
  return (
    <>
      <section aria-labelledby="home-title" className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 id="home-title" className="font-display text-hero font-bold tracking-tight text-ink">{format(t.home.greeting, { name: firstName(user.full_name) })}</h1>
          <Suspense fallback={<p className="max-w-prose text-lg text-ink-muted">{t.home.athlete}</p>}>
            <AthleteLead />
          </Suspense>
        </div>
        <ButtonLink href={ROUTES.newAnalysis} glyph="capture" className="max-sm:w-full">{t.capture.newRecording}</ButtonLink>
      </section>
      <Suspense fallback={<LoadingState label={t.athleteHome.loading} />}>
        <AthleteOverview />
      </Suspense>
    </>
  );
}
