import { AppShell } from "@/components/app/AppShell";
import { SECTION_ROLES } from "@/lib/access";
import { requireOnboarded, requireRole } from "@/lib/guard";

// Guarda de rol (§9.2): el flujo de análisis es de deportistas y entrenadores
export default async function AnalysisLayout({ children }: LayoutProps<"/analysis">) {
  const user = await requireRole(SECTION_ROLES.analysis);
  await requireOnboarded(user);
  return <AppShell user={user}>{children}</AppShell>;
}
