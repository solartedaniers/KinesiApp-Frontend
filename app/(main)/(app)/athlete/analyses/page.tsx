import type { Metadata } from "next";
import { Suspense } from "react";

import { AthleteAnalyses } from "@/components/athlete/AthleteData";
import { ButtonLink } from "@/components/instrument/Button";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.analyses };
}

// SSR con streaming: la lista llega detrás del encabezado
export default async function Page() {
  const t = await getT();
  await requireRole(SECTION_ROLES.athlete);
  return (
    <>
      <section aria-labelledby="analyses-title" className="flex flex-wrap items-end justify-between gap-4">
        <h1 id="analyses-title" className="font-display text-hero font-bold tracking-tight text-ink">{t.nav.analyses}</h1>
        <ButtonLink href={ROUTES.newAnalysis} glyph="capture" className="max-sm:w-full">{t.capture.newRecording}</ButtonLink>
      </section>
      <Suspense fallback={<LoadingState label={t.athleteHome.loading} />}>
        <AthleteAnalyses />
      </Suspense>
    </>
  );
}
