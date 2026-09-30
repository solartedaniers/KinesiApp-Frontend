import { notFound } from "next/navigation";

// Fase 1: redirect a la home del rol (RoleHomeResolver, §9.2). Ver docs/design/web-frontend-architecture.md.
export default function Page() {
  notFound();
}
