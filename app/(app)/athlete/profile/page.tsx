import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountPanel } from "@/components/app/AccountPanel";
import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { ProfileSection } from "@/components/app/ProfileSection";
import { BiometricsForm } from "@/components/athlete/BiometricsForm";
import { SECTION_ROLES } from "@/lib/access";
import { updateMyProfile } from "@/lib/actions/athletes";
import { getMyAthleteProfile } from "@/lib/data/athletes";
import { todayInAppTimeZone } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";
import { isoDate } from "@/lib/validation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.profile };
}

export default async function AthleteProfilePage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.athlete);
  const profile = await getMyAthleteProfile();
  if (!profile) redirect(ROUTES.onboarding);

  return (
    <div className={styles.page}>
      <PageHeader title={t.account.title} />
      <ProfileSection user={user} />
      <AccountPanel user={user} />
      <section className={`${styles.card} ${styles.narrow}`} aria-labelledby="biometrics-section">
        <h2 id="biometrics-section" className={styles.sectionTitle}>
          {t.biometrics.title}
        </h2>
        <BiometricsForm
          action={updateMyProfile}
          initial={{
            gender: profile.gender,
            birth_date: profile.birth_date,
            height_cm: String(profile.height_cm),
            weight_kg: String(profile.weight_kg),
          }}
          today={isoDate(todayInAppTimeZone())}
          submitLabel={t.biometrics.submit}
          pendingLabel={t.biometrics.pending}
        />
      </section>
    </div>
  );
}
