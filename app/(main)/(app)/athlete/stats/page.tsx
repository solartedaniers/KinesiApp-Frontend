import type { Metadata } from "next";
import { Suspense } from "react";

import { AthleteStats } from "@/components/athlete/AthleteStats";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.stats };
}

// SSR con streaming: los medidores y las gráficas se calculan en el servidor sobre la lista
export default async function Page() {
  const t = await getT();
  await requireRole(SECTION_ROLES.athlete);
  return (
    <>
      <section aria-labelledby="stats-title" className="grid gap-2">
        <h1 id="stats-title" className="font-display text-hero font-bold tracking-tight text-ink">{t.nav.stats}</h1>
        <p className="max-w-prose text-lg text-ink-muted">{t.stats.lead}</p>
      </section>
      <Suspense fallback={<LoadingState label={t.stats.loading} />}>
        <AthleteStats />
      </Suspense>
    </>
  );
}
