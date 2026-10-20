import { AppShell } from "@/components/app/AppShell";
import { SECTION_ROLES } from "@/lib/access";
import { requireRole } from "@/lib/guard";

// Cuenta propia: los tres roles, cada uno con su navegación
export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const user = await requireRole(SECTION_ROLES.account);
  return <AppShell user={user}>{children}</AppShell>;
}
