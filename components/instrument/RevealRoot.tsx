"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Lo que está debajo del pliegue espera a entrar en pantalla para animarse: agujas, contadores y
 * trazos se verían ya terminados si corrieran al cargar. Sin JS todo queda en su estado final.
 */
export function RevealRoot() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-reveal", "go");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    for (const element of document.querySelectorAll("[data-reveal]")) {
      if (element.getBoundingClientRect().top < window.innerHeight) continue;
      element.setAttribute("data-reveal", "wait");
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
