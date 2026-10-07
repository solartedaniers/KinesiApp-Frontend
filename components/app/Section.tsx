import Link from "next/link";
import type { ReactNode } from "react";

import { pageStyles } from "./page-classes";

/** Bloque titulado dentro de una página, con un enlace opcional a la vista completa. */
export function Section({ title, action, children }: { title: string; action?: { href: string; label: string }; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <h2 className={pageStyles.sectionTitle}>{title}</h2>
        {action && <Link href={action.href}>{action.label}</Link>}
      </header>
      {children}
    </section>
  );
}
