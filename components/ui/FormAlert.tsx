import type { ReactNode } from "react";

import styles from "./FormAlert.module.css";
import { Icon, type IconName } from "./Icon";

type Tone = "error" | "success" | "info";

const ICON_BY_TONE: Record<Tone, IconName> = { error: "alert", success: "check", info: "info" };

export function FormAlert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      <span className={styles.icon}>
        <Icon name={ICON_BY_TONE[tone]} size={18} />
      </span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
