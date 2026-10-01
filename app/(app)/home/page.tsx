import { redirect } from "next/navigation";

import { homeFor } from "@/lib/access";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/session";

// RoleHomeResolver: lee la sesión en el servidor y redirige a la home del rol (§3)
export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? homeFor(user.role) : ROUTES.sessionExpired);
}
