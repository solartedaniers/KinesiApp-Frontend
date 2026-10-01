import { EmptyState } from "@/components/app/EmptyState";
import { t } from "@/lib/i18n";

/** Sin ficha física no hay análisis. Crearla es una mutación: llega en la Fase 3. */
export function ProfileMissing() {
  return <EmptyState icon="user" title={t.athleteHome.profileMissingTitle} body={t.athleteHome.profileMissingBody} />;
}
