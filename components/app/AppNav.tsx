"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Glyph } from "@/components/instrument/Glyph";
import { shellStyles as styles } from "@/components/instrument/shell-classes";
import { activeNavHref, type NavItem } from "@/lib/access";
import { useT } from "@/lib/i18n/client";

/** Pestañas del rol: arriba en el computador y abajo en el celular. Es cliente solo para marcar la activa. */
export function AppNav({ items, placement }: { items: NavItem[]; placement: "top" | "bottom" }) {
  const t = useT();
  const active = activeNavHref(items, usePathname());
  const top = placement === "top";
  return (
    <nav aria-label={t.nav.label} className={top ? "ml-2 max-xl:hidden" : `${styles.bottom} xl:hidden`}>
      <ul className={top ? "flex gap-1" : "flex"}>
        {items.map((item) => (
          <li key={item.href} className={top ? undefined : "flex flex-1"}>
            <Link href={item.href} className={top ? styles.tab : styles.bottomTab} aria-current={item.href === active ? "page" : undefined}>
              <Glyph name={item.glyph} size={top ? 18 : 22} />
              {t.nav[item.key]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
