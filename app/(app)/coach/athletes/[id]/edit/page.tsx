import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { AvatarEditor } from "@/components/AvatarEditor";
import { ManagedAthleteForm } from "@/components/coach/ManagedAthleteForm";
import { Icon } from "@/components/ui/Icon";
import { SECTION_ROLES } from "@/lib/access";
import { updateManagedAthlete } from "@/lib/actions/managed-athletes";
import { removeManagedAvatar, uploadManagedAvatar } from "@/lib/actions/profile";
import { getMyAthlete } from "@/lib/data/coach";
import { todayInAppTimeZone } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { coachAthletePath } from "@/lib/routes";
import { isoDate } from "@/lib/validation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.coach.editAthleteTitle };
}

// Sólo deportistas gestionados: la ficha de uno con cuenta la edita el propio deportista
export default async function EditManagedAthletePage({ params }: PageProps<"/coach/athletes/[id]/edit">) {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  const athleteId = Number((await params).id);
  if (!Number.isInteger(athleteId) || athleteId <= 0) notFound();
  const athlete = await getMyAthlete(athleteId);
  if (!athlete.is_managed) notFound();

  return (
    <div className={styles.page}>
      <Link href={coachAthletePath(athlete.id)} className={styles.backLink}>
        <Icon name="chevronRight" size={16} />
        {t.common.back}
      </Link>
      <PageHeader title={t.coach.editAthleteTitle} subtitle={athlete.display_name} />
      <section className={`${styles.card} ${styles.narrow}`} aria-label={t.profile.photo}>
        <AvatarEditor
          name={athlete.display_name}
          imageUrl={athlete.display_avatar}
          upload={uploadManagedAvatar.bind(null, athlete.id)}
          remove={removeManagedAvatar.bind(null, athlete.id)}
        />
      </section>
      <section className={`${styles.card} ${styles.narrow}`}>
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
    </div>
  );
}
