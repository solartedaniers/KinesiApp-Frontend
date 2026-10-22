import type { Metadata } from "next";
import Link from "next/link";

import { ChangePasswordForm } from "@/components/app/ChangePasswordForm";
import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { NAV_BY_ROLE, SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.changePassword.metaTitle };
}

export default async function ChangePasswordPage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.account);
  const profileHref = NAV_BY_ROLE[user.role].find((item) => item.key === "profile")?.href;

  return (
    <div className={styles.page}>
      <PageHeader title={t.changePassword.title} subtitle={t.changePassword.subtitle} />
      <section className={`${styles.card} ${styles.narrow}`}>
        <ChangePasswordForm email={user.email} />
        {profileHref && <Link href={profileHref}>{t.changePassword.back}</Link>}
      </section>
    </div>
  );
}
