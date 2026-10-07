import type { Metadata } from "next";
import Link from "next/link";

import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { ConsentForm } from "@/components/consent/ConsentForm";
import { VideoConsentText } from "@/components/consent/VideoConsentText";
import { SECTION_ROLES } from "@/lib/access";
import { grantVideoConsent } from "@/lib/actions/analyses";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { NEXT_PARAM, ROUTES, safeNextPath } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.consent.title };
}

// Quien sube (el deportista, o el coach por un gestionado) acepta la versión vigente antes de subir
export default async function VideoConsentPage({ searchParams }: PageProps<"/analyses/consent">) {
  const t = await getT();
  await requireRole(SECTION_ROLES.analysis);
  const nextParam = (await searchParams)[NEXT_PARAM];
  const next = safeNextPath(typeof nextParam === "string" ? nextParam : null) ?? ROUTES.newAnalysis;

  return (
    <div className={styles.page}>
      <PageHeader title={t.consent.title} />
      <section className={`${styles.card} ${styles.narrow}`}>
        <VideoConsentText />
        <Link href={ROUTES.legalVideoConsent}>{t.consent.readLegal}</Link>
        <ConsentForm action={grantVideoConsent.bind(null, next)} />
      </section>
    </div>
  );
}
