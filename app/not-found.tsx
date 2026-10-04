import type { Metadata } from "next";

import { Logo } from "@/components/brand/Logo";
import { PreferencesControls } from "@/components/app/PreferencesControls";
import { ButtonLink } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

import styles from "./not-found.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.notFound.metaTitle };
}

// Única página 404: también la muestran los recursos ajenos (403 del backend → notFound) sin
// revelar que existen. "Ir al inicio" pasa por /home, que decide según haya sesión o no
export default async function NotFound() {
  const t = await getT();
  return (
    <main className={styles.page}>
      <PreferencesControls className={styles.preferences} />
      <Logo href={ROUTES.landing} />
      <p className={styles.code}>{t.notFound.code}</p>
      <h1 className={styles.title}>{t.notFound.title}</h1>
      <p className={styles.body}>{t.notFound.body}</p>
      <ButtonLink href={ROUTES.home}>{t.notFound.home}</ButtonLink>
    </main>
  );
}
