import type { Metadata } from "next";

import { DirectionShell } from "@/components/directions/DirectionShell";
import { InstrumentChart } from "@/components/directions/instrument/InstrumentChart";
import { InstrumentHeader } from "@/components/directions/instrument/InstrumentHeader";
import { InstrumentResult } from "@/components/directions/instrument/InstrumentResult";
import { LiveReading } from "@/components/directions/instrument/LiveReading";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  // Es una propuesta de diseño para revisar, no una página pública: no la indexo
  return { title: `${t.styleGuide.directions.c.name} · ${t.styleGuide.metaTitle}`, description: t.styleGuide.directions.c.phrase, robots: { index: false, follow: false } };
}

export default function InstrumentDirectionPage() {
  return (
    <DirectionShell id="c" header={<InstrumentHeader />}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <InstrumentResult />
        <LiveReading />
      </div>
      <InstrumentChart />
    </DirectionShell>
  );
}
