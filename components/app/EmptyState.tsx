import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";

import styles from "./Page.module.css";

export function EmptyState({ icon, title, body, children }: { icon: IconName; title: string; body?: string; children?: ReactNode }) {
  return (
    <section className={`${styles.card} ${styles.empty}`}>
      <span className={styles.emptyIcon}>
        <Icon name={icon} size={26} />
      </span>
      <h2 className={styles.emptyTitle}>{title}</h2>
      {body && <p>{body}</p>}
      {children}
    </section>
  );
}
