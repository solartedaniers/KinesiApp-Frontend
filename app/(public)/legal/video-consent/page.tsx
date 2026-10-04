import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/components/app/Page.module.css";
import { PageHeader } from "@/components/app/PageHeader";
import { PreferencesControls } from "@/components/app/PreferencesControls";
import { VideoConsentText } from "@/components/consent/VideoConsentText";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.consent.title };
}

// Pública: se puede leer antes de crear la cuenta
export default async function LegalVideoConsentPage() {
  const t = await getT();
  return (
    <>
      <PreferencesControls className={styles.preferences} />
      <main className={`${styles.page} ${styles.errorPage} ${styles.narrow}`}>
        <PageHeader title={t.consent.title} />
        <VideoConsentText />
        <p>{t.app.disclaimer}</p>
        <Link href={ROUTES.landing}>{t.notFound.home}</Link>
      </main>
    </>
  );
}
