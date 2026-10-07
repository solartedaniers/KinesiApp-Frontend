import { ChartSkeleton } from "@/components/app/Skeleton";
import { getT } from "@/lib/i18n/server";

import { chatStyles as styles } from "./chat-classes";

/** Mientras la IA prepara la explicación inicial (unos segundos). */
export async function ChatCardSkeleton() {
  const t = await getT();
  return (
    <div className={styles.panel} aria-busy="true">
      <p className={styles.typing}>{t.chat.preparing}</p>
      <ChartSkeleton />
    </div>
  );
}
