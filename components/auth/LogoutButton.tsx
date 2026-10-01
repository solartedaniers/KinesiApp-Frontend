import type { ReactNode } from "react";

import { logout } from "@/lib/actions/auth";

/** Formulario de servidor: cierra sesión incluso sin JavaScript. El aspecto lo decide quien lo usa. */
export function LogoutButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <form action={logout}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
