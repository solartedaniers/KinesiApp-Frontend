import Link from "next/link";


import styles from "./Logo.module.css";
import { getT } from "@/lib/i18n/server";

/**
 * Marca: cadera-rodilla-tobillo con el ángulo de la rodilla resaltado. `collapsible` oculta el nombre
 * en celulares muy angostos (queda el ícono; el aria-label conserva el nombre).
 */
export async function Logo({ href, onBrand = false, collapsible = false, size = 32 }: { href: string; onBrand?: boolean; collapsible?: boolean; size?: number }) {
  const t = await getT();
  const className = [styles.logo, onBrand && styles.onBrand, collapsible && styles.collapsible].filter(Boolean).join(" ");
  return (
    <Link href={href} className={className} aria-label={t.app.name}>
      <svg className={styles.mark} width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect className={styles.markTile} width="32" height="32" rx="9" />
        <path className={styles.markAccent} d="M13.2 13.6a4.5 4.5 0 0 0 4.6 3.9" fill="none" strokeWidth="2" strokeLinecap="round" />
        <path className={styles.markStroke} d="M10 7l6.5 10L12 25" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle className={styles.markTile} cx="16.5" cy="17" r="2.2" />
        <circle className={styles.markStroke} cx="16.5" cy="17" r="2.2" fill="none" strokeWidth="2" />
      </svg>
      <span>{t.app.name}</span>
    </Link>
  );
}
