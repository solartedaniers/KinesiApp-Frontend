import type { Metadata } from "next";
import { Suspense } from "react";

import { AssignmentsTable } from "@/components/admin/AdminData";
import { PageIntro } from "@/components/app/PageIntro";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.assignments };
}

// SSR (§3): entrenador de cada deportista, con la asignación en la misma fila
export default async function Page() {
  const t = await getT();
  await requireRole(SECTION_ROLES.admin);
  return (
    <>
      <PageIntro title={t.nav.assignments} lead={t.admin.assignmentsSubtitle} />
      <Suspense fallback={<LoadingState label={t.adminHome.loading} />}>
        <AssignmentsTable />
      </Suspense>
    </>
  );
}
