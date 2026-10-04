import type { Metadata } from "next";

import { AccountPanel } from "@/components/app/AccountPanel";
import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { ProfileSection } from "@/components/app/ProfileSection";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.profile };
}

export default async function CoachProfilePage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.coach);
  return (
    <div className={styles.page}>
      <PageHeader title={t.account.title} />
      <ProfileSection user={user} />
      <AccountPanel user={user} />
    </div>
  );
}
