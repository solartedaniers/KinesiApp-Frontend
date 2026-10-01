import { format, t } from "@/lib/i18n";
import type { User } from "@/lib/types";

import { ComingSoon } from "./ComingSoon";
import styles from "./Page.module.css";
import { PageHeader } from "./PageHeader";

/** Home de cada rol en la Fase 1: saludo y espacio para el resumen que llega en la Fase 2. */
export function RoleHome({ user }: { user: User }) {
  const firstName = user.full_name.split(/\s+/)[0] ?? user.full_name;
  return (
    <div className={styles.page}>
      <PageHeader title={format(t.home.greeting, { name: firstName })} subtitle={t.home[user.role]} />
      <ComingSoon />
    </div>
  );
}
