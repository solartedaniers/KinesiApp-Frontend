import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";

type StyleProps = { variant?: Variant; block?: boolean };

const BASE =
  "inline-flex min-h-control items-center justify-center gap-2 rounded-control border px-4 text-[0.95rem] font-semibold " +
  "transition-colors duration-fast hover:no-underline disabled:cursor-progress disabled:opacity-60 aria-disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  primary: "border-transparent bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border-line-strong bg-panel text-ink hover:border-accent hover:text-accent",
  ghost: "border-transparent bg-transparent text-ink-muted hover:bg-sunken hover:text-ink",
};

function classes({ variant = "primary", block }: StyleProps, extra?: string): string {
  return [BASE, VARIANTS[variant], block && "w-full", extra].filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  StyleProps & {
    /** Muestra el indicador de carga, deshabilita el botón y cambia el texto. */
    pending?: boolean;
    pendingLabel?: string;
  };

export function Button({ variant, block, pending, pendingLabel, children, className, disabled, ...rest }: ButtonProps) {
  return (
    <button className={classes({ variant, block }, className)} disabled={disabled || pending} {...rest}>
      {pending && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:[animation-duration:2s]"
          aria-hidden
        />
      )}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function ButtonLink({ variant, block, className, ...rest }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={classes({ variant, block }, className)} {...rest} />;
}
