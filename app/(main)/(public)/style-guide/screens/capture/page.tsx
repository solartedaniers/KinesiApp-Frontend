import type { Metadata } from "next";

import { CaptureSimulator } from "@/components/instrument/CaptureSimulator";
import { ScreenShell } from "@/components/instrument/ScreenShell";
import { VIDEO_MAX_SECONDS } from "@/lib/config";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: `${t.styleGuide.screens.capture.name} · ${t.styleGuide.metaTitle}`, robots: { index: false, follow: false } };
}

export default async function CaptureScreen() {
  const t = await getT();
  const c = t.styleGuide.screens.capture;
  return (
    <ScreenShell active="capture">
      <section aria-labelledby="capture-title" className="grid gap-2">
        <h1 id="capture-title" className="font-display text-hero font-bold tracking-tight text-ink">{c.title}</h1>
        <p className="max-w-prose text-lg text-ink-muted">{format(c.lead, { seconds: VIDEO_MAX_SECONDS })}</p>
      </section>
      <CaptureSimulator />
    </ScreenShell>
  );
}
