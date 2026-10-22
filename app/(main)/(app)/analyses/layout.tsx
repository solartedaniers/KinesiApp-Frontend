import { AppShell } from "@/components/app/AppShell";
import { SECTION_ROLES } from "@/lib/access";
import { requireOnboarded, requireRole } from "@/lib/guard";

// Guarda de rol: el flujo de análisis es de deportistas y entrenadores
export default async function AnalysisLayout({ children }: LayoutProps<"/analyses">) {
  const user = await requireRole(SECTION_ROLES.analysis);
  await requireOnboarded(user);
  return <AppShell user={user}>{children}</AppShell>;
}
