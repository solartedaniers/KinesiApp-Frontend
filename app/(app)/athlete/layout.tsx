import { AppShell } from "@/components/app/AppShell";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";

// Guarda de rol (§9.2): sólo deportistas; cualquier otro rol vuelve a su propia home
export default async function AthleteLayout({ children }: LayoutProps<"/athlete">) {
  const user = await requireRole(SECTION_ROLES.athlete);
  return <AppShell user={user}>{children}</AppShell>;
}
