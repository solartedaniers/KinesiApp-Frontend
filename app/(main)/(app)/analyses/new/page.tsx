import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CaptureFlow } from "@/components/CaptureFlow";
import { SECTION_ROLES } from "@/lib/access";
import { getMyAthleteProfile } from "@/lib/data/athletes";
import { listMyAthletes } from "@/lib/data/coach";
import { getClientPolicy } from "@/lib/data/public";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { ATHLETE_PARAM, newAnalysisPath, parseId, ROUTES, withNext } from "@/lib/routes";
import type { AthleteProfile, User } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.capture.metaTitle };
}

/** El deportista sube para sí mismo; el coach, sólo para sus deportistas gestionados (`?athlete=`). */
async function uploadTarget(user: User, athleteParam: string | string[] | undefined): Promise<AthleteProfile | null> {
  if (user.role === "athlete") return getMyAthleteProfile();
  const athleteId = parseId(athleteParam);
  return (await listMyAthletes()).find((athlete) => athlete.id === athleteId && athlete.is_managed) ?? null;
}

// SSR de la decisión (a quién se sube, consentimiento, límites) + isla CSR con la cámara y la subida
export default async function NewAnalysisPage({ searchParams }: PageProps<"/analyses/new">) {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.analysis);
  const athlete = await uploadTarget(user, (await searchParams)[ATHLETE_PARAM]);
  if (!athlete) notFound();

  const policy = await getClientPolicy();
  if (user.video_consent_version !== policy.video_consent_version) {
    redirect(withNext(ROUTES.videoConsent, newAnalysisPath(user.role === "coach" ? athlete.id : undefined)));
  }

  return (
    <>
      <section aria-labelledby="capture-title" className="grid gap-2">
        {user.role === "coach" && <p className="text-sm font-semibold text-ink-muted">{format(t.capture.forAthlete, { name: athlete.display_name })}</p>}
        <h1 id="capture-title" className="font-display text-hero font-bold tracking-tight text-ink">{t.capture.title}</h1>
        <p className="max-w-prose text-lg text-ink-muted">{format(t.capture.lead, { seconds: policy.video_max_duration_seconds })}</p>
      </section>
      <CaptureFlow athleteId={athlete.id} maxBytes={policy.video_max_size_bytes} maxSeconds={policy.video_max_duration_seconds} />
    </>
  );
}
