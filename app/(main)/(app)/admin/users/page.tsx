import type { Metadata } from "next";
import { Suspense } from "react";

import { UsersTable } from "@/components/admin/AdminData";
import { PageIntro } from "@/components/app/PageIntro";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.users };
}

// SSR (§3): todas las cuentas, con cambio de rol y activación por fila
export default async function Page() {
  const t = await getT();
  const admin = await requireRole(SECTION_ROLES.admin);
  return (
    <>
      <PageIntro title={t.nav.users} lead={t.admin.usersSubtitle} />
      <Suspense fallback={<LoadingState label={t.adminHome.loading} />}>
        <UsersTable currentUserId={admin.id} />
      </Suspense>
    </>
  );
}
