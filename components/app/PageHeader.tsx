import { pageStyles as styles } from "@/components/app/page-classes";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
