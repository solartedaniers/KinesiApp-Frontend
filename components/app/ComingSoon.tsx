import { Icon } from "@/components/ui/Icon";
import { t } from "@/lib/i18n";

import styles from "./Page.module.css";

/** Estado vacío de las secciones que llegan en fases siguientes (datos: Fase 2, edición: Fase 3). */
export function ComingSoon() {
  return (
    <section className={`${styles.card} ${styles.empty}`}>
      <span className={styles.emptyIcon}>
        <Icon name="clock" size={26} />
      </span>
      <h2 className={styles.emptyTitle}>{t.comingSoon.title}</h2>
      <p>{t.comingSoon.body}</p>
    </section>
  );
}
