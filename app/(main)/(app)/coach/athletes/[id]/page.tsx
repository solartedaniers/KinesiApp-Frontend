import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Avatar } from "@/components/app/Avatar";
import { AthleteProfileCard } from "@/components/coach/AthleteProfileCard";
import { CoachAthleteRecordings } from "@/components/coach/CoachData";
import { ButtonLink } from "@/components/instrument/Button";
import { ConfirmDialog } from "@/components/instrument/Dialog";
import { Glyph } from "@/components/instrument/Glyph";
import { LoadingState } from "@/components/instrument/States";
import { Notice } from "@/components/instrument/Status";
import { SECTION_ROLES } from "@/lib/access";
import { deleteManagedAthlete } from "@/lib/actions/managed-athletes";
import { getMyAthlete } from "@/lib/data/coach";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { coachAthleteEditPath, newAnalysisPath, parseId, ROUTES } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/coach/athletes/[id]">): Promise<Metadata> {
  const t = await getT();
  const athleteId = parseId((await params).id);
  return { title: athleteId ? (await getMyAthlete(athleteId)).display_name : t.coach.athleteMetaTitle };
}

// SSR con streaming: la ficha sale primero (viene de la lista del coach, ya autorizada);
// medidores, evolución y grabaciones llegan después en el mismo stream
export default async function CoachAthletePage({ params }: PageProps<"/coach/athletes/[id]">) {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  const athleteId = parseId((await params).id);
  if (!athleteId) notFound();
  const athlete = await getMyAthlete(athleteId);

  return (
    <>
      <Link href={ROUTES.coachAthletes} className="inline-flex w-fit items-center gap-1 text-sm font-semibold">
        <Glyph name="chevronLeft" size={16} />
        {t.coach.backToTeam}
      </Link>
      <section aria-labelledby="page-title" className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} size="lg" />
          <div className="grid min-w-0 gap-1">
            <h1 id="page-title" className="font-display text-hero font-bold tracking-tight text-ink [overflow-wrap:anywhere]">{athlete.display_name}</h1>
            <p className="text-ink-muted">{athlete.is_managed ? `${t.athleteProfile.managed} · ${t.athleteProfile.managedHint}` : t.athleteProfile.withAccount}</p>
          </div>
        </div>
        {/* El coach sólo gestiona (graba, edita, borra) a los deportistas sin cuenta propia */}
        {athlete.is_managed && (
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={newAnalysisPath(athlete.id)} glyph="capture">{t.coach.record}</ButtonLink>
            <ButtonLink href={coachAthleteEditPath(athlete.id)} variant="secondary" glyph="edit">{t.coach.editAthlete}</ButtonLink>
            <ConfirmDialog
              labels={{ open: t.coach.deleteAthlete, title: format(t.coach.deleteAthleteTitle, { name: athlete.display_name }), body: t.coach.deleteAthleteBody, confirm: t.common.delete, cancel: t.common.cancel }}
              action={deleteManagedAthlete.bind(null, athlete.id)}
            />
          </div>
        )}
      </section>
      {!athlete.is_managed && <Notice tone="info" live={false}>{t.coach.recordOwnHint}</Notice>}
      <AthleteProfileCard athlete={athlete} />
      <Suspense fallback={<LoadingState label={t.coach.athleteLoading} />}>
        <CoachAthleteRecordings athleteId={athlete.id} />
      </Suspense>
    </>
  );
}
