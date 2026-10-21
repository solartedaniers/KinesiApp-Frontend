import type { AccountStatus } from "@/lib/admin-stats";
import { getT } from "@/lib/i18n/server";

// Sin rojo: el rojo es del riesgo. Deshabilitada va en tinta apagada, sin verificar en el ámbar del tronco
const TONE: Record<AccountStatus, { chip: string; dot: string }> = {
  active: { chip: "bg-zone-target-soft text-zone-target", dot: "bg-zone-target" },
  unverified: { chip: "bg-trunk-soft text-trunk", dot: "bg-trunk" },
  disabled: { chip: "bg-sunken text-ink-muted", dot: "bg-ink-muted" },
};

/** Estado de la cuenta: punto de color más la palabra, igual que las zonas. */
export async function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const t = await getT();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONE[status].chip}`}>
      <span className={`size-2 rounded-full ${TONE[status].dot}`} aria-hidden />
      {t.admin.status[status]}
    </span>
  );
}
