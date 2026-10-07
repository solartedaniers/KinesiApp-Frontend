import Link from "next/link";

import { getT } from "@/lib/i18n/server";

import { LogoMark } from "./LogoMark";

/**
 * Marca: una "K" formada por un eje vertical y una articulación (cadera, rodilla, tobillo) con sus
 * marcadores de captura y el arco del ángulo de la rodilla. Es el mismo dibujo que app/icon.svg.
 * `collapsible` oculta el nombre en celulares muy angostos (el aria-label conserva el nombre).
 */
export async function Logo({ href, collapsible = false, size = 30 }: { href: string; collapsible?: boolean; size?: number }) {
  const t = await getT();
  return (
    <Link
      href={href}
      aria-label={t.app.name}
      className="inline-flex items-center gap-2.5 rounded-control font-display text-lg font-semibold tracking-tight text-ink [font-stretch:112%] hover:no-underline"
    >
      <LogoMark size={size} />
      <span className={collapsible ? "max-[399px]:hidden" : undefined}>{t.app.name}</span>
    </Link>
  );
}
