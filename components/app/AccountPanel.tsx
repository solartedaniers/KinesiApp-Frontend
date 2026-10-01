import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";
import type { User } from "@/lib/types";

import styles from "./Page.module.css";
import { UserBadge } from "./UserBadge";

/** Datos de la cuenta (sólo lectura) y acceso al cambio de contraseña, común a los tres roles. */
export function AccountPanel({ user }: { user: User }) {
  return (
    <section className={`${styles.card} ${styles.narrow}`} aria-labelledby="account-section">
      <h2 id="account-section" className={styles.sectionTitle}>
        {t.account.section}
      </h2>
      <UserBadge user={user} />
      <dl className={styles.details}>
        <div className={styles.detail}>
          <dt>{t.fields.email}</dt>
          <dd>{user.email}</dd>
        </div>
        <div className={styles.detail}>
          <dt>{t.account.role}</dt>
          <dd>{t.roles[user.role]}</dd>
        </div>
      </dl>
      <Link href={ROUTES.changePassword} className={styles.rowLink}>
        <span className={styles.rowIcon}>
          <Icon name="lock" />
        </span>
        <span className={styles.rowText}>
          <span>{t.account.changePassword}</span>
          <span className={styles.rowHint}>{t.account.changePasswordHint}</span>
        </span>
        <Icon name="chevronRight" />
      </Link>
    </section>
  );
}
