import type { Metadata } from "next";
import { Suspense } from "react";

import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { AthleteAnalyses } from "@/components/athlete/AthleteData";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.analyses };
}

// SSR streaming (§3): la lista llega detrás del encabezado
export default async function Page() {
  const t = await getT();
  await requireRole(SECTION_ROLES.athlete);
  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <PageHeader title={t.nav.analyses} />
        <ButtonLink href={ROUTES.newAnalysis}>
          <Icon name="upload" size={18} />
          {t.capture.newRecording}
        </ButtonLink>
      </div>
      <Suspense
        fallback={
          <ListSkeleton rows={5} />
        }
      >
        <AthleteAnalyses />
      </Suspense>
    </div>
  );
}
