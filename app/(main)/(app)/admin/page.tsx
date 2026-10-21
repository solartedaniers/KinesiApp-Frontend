import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminLead, AdminOverview } from "@/components/admin/AdminData";
import { PageIntro } from "@/components/app/PageIntro";
import { LoadingState } from "@/components/instrument/States";
import { SECTION_ROLES } from "@/lib/access";
import { firstName } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.home };
}

// SSR con streaming: el saludo sale con el primer chunk; la frase y los medidores del sistema después
export default async function AdminHomePage() {
  const t = await getT();
  const user = await requireRole(SECTION_ROLES.admin);
  return (
    <>
      <PageIntro
        title={format(t.home.greeting, { name: firstName(user.full_name) })}
        lead={
          <Suspense fallback={<p className="max-w-prose text-lg text-ink-muted">{t.home.admin}</p>}>
            <AdminLead />
          </Suspense>
        }
      />
      <Suspense fallback={<LoadingState label={t.adminHome.loading} />}>
        <AdminOverview />
      </Suspense>
    </>
  );
}
