import type { Metadata } from "next";

import { DirectionShell } from "@/components/directions/DirectionShell";
import { RepBeat } from "@/components/directions/rhythm/RepBeat";
import { RhythmChart } from "@/components/directions/rhythm/RhythmChart";
import { RhythmHeader } from "@/components/directions/rhythm/RhythmHeader";
import { RhythmResult } from "@/components/directions/rhythm/RhythmResult";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  // Es una propuesta de diseño para revisar, no una página pública: no la indexo
  return { title: `${t.styleGuide.directions.b.name} · ${t.styleGuide.metaTitle}`, description: t.styleGuide.directions.b.phrase, robots: { index: false, follow: false } };
}

export default function RhythmDirectionPage() {
  return (
    <DirectionShell id="b" header={<RhythmHeader />}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <RepBeat />
        <RhythmResult />
      </div>
      <RhythmChart />
    </DirectionShell>
  );
}
