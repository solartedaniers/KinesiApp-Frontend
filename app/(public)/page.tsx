import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

import styles from "./landing.module.css";

// SSG: sin cookies, headers ni datos por usuario; se genera en el build y se sirve desde CDN (§3)
export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Logo href={ROUTES.landing} />
        <Link className={styles.topLink} href={ROUTES.login}>
          {t.landing.signIn}
        </Link>
      </header>

      <main className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t.landing.eyebrow}</p>
          <h1 className={styles.title}>{t.landing.title}</h1>
          <p className={styles.lead}>{t.landing.lead}</p>
          <div className={styles.actions}>
            <ButtonLink href={ROUTES.register}>{t.landing.createAccount}</ButtonLink>
            <ButtonLink href={ROUTES.login} variant="secondary">
              {t.landing.signIn}
            </ButtonLink>
          </div>
        </div>

        <ul className={styles.features}>
          {t.landing.features.map((feature) => (
            <li key={feature.title} className={styles.feature}>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className={styles.footer}>{t.app.disclaimer}</footer>
    </div>
  );
}
