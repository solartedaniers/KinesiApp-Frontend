import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

import { buttonClasses, PendingNeedle } from "@/components/instrument/Button";

type Variant = "primary" | "secondary" | "ghost";

type StyleProps = { variant?: Variant; block?: boolean };

// Las pantallas existentes siguen con esta API; el aspecto es el del botón del instrumento
const VARIANT = { primary: "primary", secondary: "secondary", ghost: "quiet" } as const;

function classes({ variant = "primary", block }: StyleProps, extra?: string): string {
  return buttonClasses(VARIANT[variant], block, `hover:no-underline aria-disabled:opacity-60 ${extra ?? ""}`);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  StyleProps & {
    /** Muestra la aguja de espera, deshabilita el botón y cambia el texto. */
    pending?: boolean;
    pendingLabel?: string;
  };

export function Button({ variant, block, pending, pendingLabel, children, className, disabled, ...rest }: ButtonProps) {
  return (
    <button className={classes({ variant, block }, className)} disabled={disabled || pending} aria-busy={pending || undefined} {...rest}>
      {pending && <PendingNeedle />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function ButtonLink({ variant, block, className, ...rest }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={classes({ variant, block }, className)} {...rest} />;
}
