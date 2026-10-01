import styles from "./Avatar.module.css";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/** Foto (data URL del backend) o iniciales. Decorativa: el nombre siempre va en texto al lado. */
export function Avatar({ name, imageUrl, size = "md" }: { name: string; imageUrl?: string | null; size?: "md" | "lg" }) {
  const className = `${styles.avatar} ${styles[size]}`;
  // next/image no aporta nada sobre una data URL ya incrustada
  // eslint-disable-next-line @next/next/no-img-element
  return imageUrl ? <img className={className} src={imageUrl} alt="" /> : <span className={className} aria-hidden>{initials(name)}</span>;
}
