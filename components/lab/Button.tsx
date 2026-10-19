import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

import { LabIcon } from "./LabIcon";

import type { LabIconName } from "@/lib/design/icons";

type Variant = "primary" | "secondary" | "quiet";
type StyleProps = { variant?: Variant; block?: boolean; icon?: LabIconName };

// Esquinas casi rectas, como una ficha de laboratorio; el hundimiento al presionar confirma el toque
const BASE =
  "group inline-flex min-h-11 items-center justify-center gap-2 rounded-tag px-4 text-[0.95rem] font-semibold no-underline " +
  "transition-[background-color,color,box-shadow,transform] duration-[var(--kin-motion-hover)] ease-[var(--kin-ease-out)] " +
  "hover:no-underline active:translate-y-px active:duration-[var(--kin-motion-press)] " +
  "disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55 aria-busy:cursor-progress";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "bg-panel text-ink shadow-[inset_0_0_0_1px_var(--kin-line-strong)] hover:text-accent hover:shadow-[inset_0_0_0_1.5px_var(--kin-accent)]",
  quiet: "bg-transparent text-ink-muted hover:bg-sunken hover:text-ink",
};

function classes({ variant = "primary", block }: StyleProps, extra?: string): string {
  return [BASE, VARIANTS[variant], block && "w-full", extra].filter(Boolean).join(" ");
}

/** Mientras espera, la aguja de un transportador oscila: el mismo gesto que una medida en curso. */
function PendingNeedle() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
      <path d="M4 18a8 8 0 0 1 16 0" opacity={0.45} />
      <path className="lab-pending-needle" d="M12 18L6.5 12.5" />
    </svg>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps & { pending?: boolean; pendingLabel?: string };

export function LabButton({ variant, block, icon, pending, pendingLabel, children, className, disabled, ...rest }: ButtonProps) {
  return (
    <button className={classes({ variant, block }, className)} disabled={disabled || pending} aria-busy={pending || undefined} {...rest}>
      {pending ? <PendingNeedle /> : icon && <LabIcon name={icon} size={18} />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function LabButtonLink({ variant, block, icon, className, children, ...rest }: ComponentProps<typeof Link> & StyleProps) {
  return (
    <Link className={classes({ variant, block }, className)} {...rest}>
      {icon && <LabIcon name={icon} size={18} />}
      {children}
    </Link>
  );
}
