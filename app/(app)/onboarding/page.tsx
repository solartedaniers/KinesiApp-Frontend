import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BiometricsForm } from "@/components/athlete/BiometricsForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { SECTION_ROLES } from "@/lib/access";
import { createMyProfile } from "@/lib/actions/athletes";
import { getMyAthleteProfile } from "@/lib/data/athletes";
import { todayInAppTimeZone } from "@/lib/format";
import { requireRole } from "@/lib/guard";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";
import { isoDate } from "@/lib/validation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.onboarding.metaTitle };
}

/**
 * Pantalla obligatoria del primer ingreso del deportista: sin ficha biométrica no entra a la app
 * (la guarda de app/(app)/athlete/layout.tsx lo trae aquí). Fuera de AppShell a propósito: no hay
 * navegación a la que escapar sin completarla, sólo cerrar sesión.
 */
export default async function OnboardingPage() {
  const t = await getT();
  await requireRole(SECTION_ROLES.athlete);
  if (await getMyAthleteProfile()) redirect(ROUTES.home);

  return (
    <AuthShell
      title={t.onboarding.title}
      subtitle={t.onboarding.subtitle}
      footer={<LogoutButton label={t.session.logout}>{t.session.logout}</LogoutButton>}
    >
      <BiometricsForm
        action={createMyProfile}
        today={isoDate(todayInAppTimeZone())}
        submitLabel={t.onboarding.submit}
        pendingLabel={t.onboarding.pending}
      />
    </AuthShell>
  );
}
