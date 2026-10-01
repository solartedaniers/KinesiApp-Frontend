"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/ui/Icon";
import { activeNavHref, type NavItem } from "@/lib/access";
import { t } from "@/lib/i18n";

import styles from "./RoleNav.module.css";

/** Cliente sólo para marcar la pestaña activa (usePathname). */
export function RoleNav({ items, variant, className }: { items: NavItem[]; variant: "sidebar" | "bottom"; className?: string }) {
  const active = activeNavHref(items, usePathname());

  return (
    <nav className={[styles[variant], className].filter(Boolean).join(" ")} aria-label={t.nav.label}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.link} aria-current={item.href === active ? "page" : undefined}>
              <Icon name={item.icon} size={variant === "bottom" ? 22 : 20} />
              <span>{t.nav[item.key]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
