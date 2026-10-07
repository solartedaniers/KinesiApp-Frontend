"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/ui/Icon";
import { activeNavHref, type NavItem } from "@/lib/access";
import { useT } from "@/lib/i18n/client";

const styles = {
  list: "grid gap-0.5",
  link: "flex min-h-control items-center gap-3 rounded-control px-3 text-[0.95rem] font-medium text-ink-muted transition-colors duration-fast hover:bg-sunken hover:text-ink hover:no-underline aria-[current=page]:bg-accent-soft aria-[current=page]:font-semibold aria-[current=page]:text-accent",
};

/** Cliente sólo para marcar la pestaña activa (usePathname). */
export function RoleNav({ items, className }: { items: NavItem[]; className?: string }) {
  const t = useT();
  const active = activeNavHref(items, usePathname());

  return (
    <nav className={className} aria-label={t.nav.label}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.link} aria-current={item.href === active ? "page" : undefined}>
              <Icon name={item.icon} size={20} />
              <span>{t.nav[item.key]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
