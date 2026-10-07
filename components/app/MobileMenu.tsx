"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/lib/i18n/client";

const styles = {
  trigger: "grid size-control place-items-center rounded-control text-ink hover:bg-sunken",
  drawer: "m-0 h-dvh max-h-none w-[min(20rem,calc(100vw-3rem))] max-w-none border-r border-line bg-panel p-0 text-ink shadow-overlay backdrop:bg-backdrop open:animate-[drawer-in_200ms_ease-out]",
  panel: "flex h-full flex-col gap-4 px-4 pb-5 pt-2",
  header: "flex h-topbar items-center justify-between",
  title: "font-display text-lg font-semibold",
  close: "grid size-control place-items-center rounded-control text-ink-muted hover:bg-sunken hover:text-ink",
};

/**
 * Menú hamburguesa del celular: un <dialog> modal que se desliza desde el costado. El navegador
 * resuelve el foco atrapado, Escape y el fondo inerte. Se cierra al navegar, al tocar el fondo o
 * con el botón. El contenido (NavigationPanel) lo renderiza el servidor.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const t = useT();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Navegar desde el menú (o con atrás/adelante) lo cierra
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={t.nav.openMenu}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Icon name="menu" />
      </button>
      <dialog
        ref={dialogRef}
        className={styles.drawer}
        aria-label={t.nav.menu}
        // El clic llega al <dialog> sólo desde el fondo: el panel lo ocupa entero
        onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}
      >
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.title}>{t.nav.menu}</span>
            <button type="button" className={styles.close} aria-label={t.nav.closeMenu} onClick={() => dialogRef.current?.close()}>
              <Icon name="close" />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
