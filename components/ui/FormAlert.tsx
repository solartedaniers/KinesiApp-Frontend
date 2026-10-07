import type { ReactNode } from "react";

import { Icon, type IconName } from "./Icon";

type Tone = "error" | "success" | "info";

const ICON_BY_TONE: Record<Tone, IconName> = { error: "alert", success: "check", info: "info" };

// Sin verde/ámbar/rojo: esos colores son del riesgo. El error se distingue por el borde fuerte y el ícono
const TONE_CLASSES: Record<Tone, string> = {
  error: "border-ink bg-panel text-ink [&>span]:text-ink",
  success: "border-accent bg-accent-soft text-ink [&>span]:text-accent",
  info: "border-line-strong bg-sunken text-ink [&>span]:text-ink-muted",
};

export function FormAlert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-control border border-l-4 px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <span className="mt-px flex-none">
        <Icon name={ICON_BY_TONE[tone]} size={18} />
      </span>
      <div className="grid gap-1 [&_strong]:font-semibold">{children}</div>
    </div>
  );
}
