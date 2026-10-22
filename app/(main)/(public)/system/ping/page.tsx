import type { Metadata } from "next";
import { Suspense } from "react";

import { pageStyles as styles } from "@/components/app/page-classes";
import { PageHeader } from "@/components/app/PageHeader";
import { ListSkeleton } from "@/components/app/Skeleton";
import { PingResult } from "@/components/system/PingResult";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.systemPing.title, robots: { index: false } };
}

export default async function SystemPingPage() {
  const t = await getT();
  return (
    <main className={`${styles.page} ${styles.errorPage} ${styles.narrow}`}>
      <PageHeader title={t.systemPing.title} subtitle={t.systemPing.subtitle} />
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <PingResult />
      </Suspense>
    </main>
  );
}
