import type { Metadata } from "next";

import { RoleHome } from "@/components/app/RoleHome";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.nav.home };

// La página repite la guarda: en App Router el layout y la página se renderizan en paralelo
export default async function CoachHomePage() {
  return <RoleHome user={await requireRole(SECTION_ROLES.coach)} />;
}
