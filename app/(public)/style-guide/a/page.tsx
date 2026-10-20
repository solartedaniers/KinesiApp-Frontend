import type { Metadata } from "next";

import { DirectionShell } from "@/components/directions/DirectionShell";
import { LightTrails } from "@/components/directions/trail/LightTrails";
import { TrailChart } from "@/components/directions/trail/TrailChart";
import { TrailHeader } from "@/components/directions/trail/TrailHeader";
import { TrailResult } from "@/components/directions/trail/TrailResult";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  // Es una propuesta de diseño para revisar, no una página pública: no la indexo
  return { title: `${t.styleGuide.directions.a.name} · ${t.styleGuide.metaTitle}`, description: t.styleGuide.directions.a.phrase, robots: { index: false, follow: false } };
}

export default function TrailDirectionPage() {
  return (
    <DirectionShell id="a" header={<TrailHeader />}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <TrailResult />
        <LightTrails />
      </div>
      <TrailChart />
    </DirectionShell>
  );
}
