import { AppShell } from "@/components/app/AppShell";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";

// Guarda de rol (§9.2): sólo entrenadores; cualquier otro rol vuelve a su propia home
export default async function CoachLayout({ children }: LayoutProps<"/coach">) {
  const user = await requireRole(SECTION_ROLES.coach);
  return <AppShell user={user}>{children}</AppShell>;
}
