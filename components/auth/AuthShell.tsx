import type { ReactNode } from "react";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import { Logo } from "@/components/brand/Logo";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

import styles from "./AuthShell.module.css";

/** Marco de las pantallas de acceso: panel de marca en escritorio, sólo el logo en celular. */
export async function AuthShell({
  eyebrow,
  title,
  subtitle,
  footer,
  login = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  login?: boolean;
  children: ReactNode;
}) {
  const t = await getT();
  return (
    <div className={[styles.shell, login ? styles.loginShell : ""].filter(Boolean).join(" ")}>
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
          {footer && <div className={styles.footer}>{footer}</div>}
        </section>
        <PreferencesControls className={styles.preferences} />
      </main>
    </div>
  );
}
