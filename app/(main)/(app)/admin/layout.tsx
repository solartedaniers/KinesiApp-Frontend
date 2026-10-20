import { AppShell } from "@/components/app/AppShell";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";

// Guarda de rol (§9.2): sólo administradores; cualquier otro rol vuelve a su propia home
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireRole(SECTION_ROLES.admin);
  return <AppShell user={user}>{children}</AppShell>;
}
