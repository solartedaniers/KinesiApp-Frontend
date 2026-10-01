import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./Section.module.css";

/** Bloque titulado dentro de una página, con un enlace opcional a la vista completa. */
export function Section({ title, action, children }: { title: string; action?: { href: string; label: string }; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {action && <Link href={action.href}>{action.label}</Link>}
      </header>
      {children}
    </section>
  );
}
