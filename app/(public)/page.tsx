import Link from "next/link";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

import styles from "./landing.module.css";

// SSR sólo por el idioma (cookie o Accept-Language): no hay datos del usuario
export default async function LandingPage() {
  const t = await getT();
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

      <footer className={styles.footer}>
        <PreferencesControls className={styles.preferences} />
        <p>{t.app.disclaimer}</p>
      </footer>
    </div>
  );
}
