import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

import styles from "./AuthShell.module.css";

/** Marco de las pantallas de acceso: panel de marca en escritorio, sólo el logo en celular. */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.brand}>
        <Logo href={ROUTES.landing} onBrand />
        <p className={styles.tagline}>{t.authShell.tagline}</p>
        <ul className={styles.points}>
          {t.authShell.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </aside>

      <main className={styles.main}>
        <div className={styles.mobileLogo}>
          <Logo href={ROUTES.landing} />
        </div>
        <section className={styles.card} aria-labelledby="auth-title">
          <header className={styles.header}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h1 id="auth-title" className={styles.title}>
              {title}
            </h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
          {children}
          {footer && <p className={styles.footer}>{footer}</p>}
        </section>
      </main>
    </div>
  );
}
