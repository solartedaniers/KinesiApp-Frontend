import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/app/PageIntro";
import { ManagedAthleteForm } from "@/components/coach/ManagedAthleteForm";
import { Glyph } from "@/components/instrument/Glyph";
import { SECTION_ROLES } from "@/lib/access";
import { createManagedAthlete } from "@/lib/actions/managed-athletes";
import { biometricsRules } from "@/lib/biometrics";
import { getClientPolicy } from "@/lib/data/public";
import { todayInAppTimeZone } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";
import { isoDate } from "@/lib/validation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.coach.newAthleteTitle };
}

export default async function NewManagedAthletePage() {
  const t = await getT();
  await requireRole(SECTION_ROLES.coach);
  return (
    <>
      <Link href={ROUTES.coachAthletes} className="inline-flex w-fit items-center gap-1 text-sm font-semibold">
        <Glyph name="chevronLeft" size={16} />
        {t.coach.backToTeam}
      </Link>
      <PageIntro title={t.coach.newAthleteTitle} lead={t.coach.newAthleteSubtitle} />
      <section className="kin-card grid max-w-2xl gap-4 p-5 sm:p-6">
        <ManagedAthleteForm
          action={createManagedAthlete}
          today={isoDate(todayInAppTimeZone())}
          rules={biometricsRules(await getClientPolicy())}
          submitLabel={t.coach.createAthlete}
          pendingLabel={t.coach.creatingAthlete}
        />
      </section>
    </>
  );
}
