import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/app/PageIntro";
import { AvatarEditor } from "@/components/AvatarEditor";
import { ManagedAthleteForm } from "@/components/coach/ManagedAthleteForm";
import { Glyph } from "@/components/instrument/Glyph";
import { SECTION_ROLES } from "@/lib/access";
import { updateManagedAthlete } from "@/lib/actions/managed-athletes";
import { confirmManagedAvatarUpload, removeManagedAvatar, startManagedAvatarUpload } from "@/lib/actions/profile";
import { getMyAthlete } from "@/lib/data/coach";
import { todayInAppTimeZone } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { coachAthletePath, parseId } from "@/lib/routes";
import { isoDate } from "@/lib/validation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.coach.editAthleteTitle };
}

// Sólo deportistas gestionados: la ficha de uno con cuenta la edita el propio deportista
export default async function EditManagedAthletePage({ params }: PageProps<"/coach/athletes/[id]/edit">) {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  const athleteId = parseId((await params).id);
  if (!athleteId) notFound();
  const athlete = await getMyAthlete(athleteId);
  if (!athlete.is_managed) notFound();

  return (
    <>
      <Link href={coachAthletePath(athlete.id)} className="inline-flex w-fit items-center gap-1 text-sm font-semibold">
        <Glyph name="chevronLeft" size={16} />
        {t.common.back}
      </Link>
      <PageIntro title={t.coach.editAthleteTitle} lead={athlete.display_name} />
      <section className="kin-card grid max-w-2xl gap-4 p-5 sm:p-6" aria-label={t.profile.photo}>
        <AvatarEditor
          name={athlete.display_name}
          imageUrl={athlete.display_avatar}
          start={startManagedAvatarUpload.bind(null, athlete.id)}
          confirm={confirmManagedAvatarUpload.bind(null, athlete.id)}
          remove={removeManagedAvatar.bind(null, athlete.id)}
        />
      </section>
      <section className="kin-card grid max-w-2xl gap-4 p-5 sm:p-6">
        <ManagedAthleteForm
          action={updateManagedAthlete.bind(null, athlete.id)}
          initial={{
            full_name: athlete.display_name,
            gender: athlete.gender,
            birth_date: athlete.birth_date,
            height_cm: String(athlete.height_cm),
            weight_kg: String(athlete.weight_kg),
          }}
          today={isoDate(todayInAppTimeZone())}
          submitLabel={t.common.save}
          pendingLabel={t.common.saving}
        />
      </section>
    </>
  );
}
