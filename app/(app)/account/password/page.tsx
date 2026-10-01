import type { Metadata } from "next";
import Link from "next/link";

import { ChangePasswordForm } from "@/components/app/ChangePasswordForm";
import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { NAV_BY_ROLE, SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.changePassword.metaTitle };

export default async function ChangePasswordPage() {
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
