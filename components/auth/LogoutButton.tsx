import type { ReactNode } from "react";

import { ROUTES } from "@/lib/routes";

/** POST nativo al Route Handler de logout: funciona sin JS y fuerza una navegación completa. */
export function LogoutButton({ className, label, children }: { className?: string; label: string; children: ReactNode }) {
  return (
    <form method="post" action={ROUTES.logout}>
      <button type="submit" className={className} aria-label={label} title={label}>
        {children}
      </button>
    </form>
  );
}
