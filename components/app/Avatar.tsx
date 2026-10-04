import styles from "./Avatar.module.css";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/** Foto (URL pública del bucket de imágenes) o iniciales. Decorativa: el nombre siempre va en texto al lado. */
export function Avatar({ name, imageUrl, size = "md" }: { name: string; imageUrl?: string | null; size?: "md" | "lg" }) {
  const className = `${styles.avatar} ${styles[size]}`;
  // <img> y no next/image: es una foto chica ya comprimida a 512 px, y next/image exigiría declarar
  // el dominio del bucket en next.config y pasar cada foto por el optimizador
  // eslint-disable-next-line @next/next/no-img-element
  return imageUrl ? <img className={className} src={imageUrl} alt="" /> : <span className={className} aria-hidden>{initials(name)}</span>;
}
