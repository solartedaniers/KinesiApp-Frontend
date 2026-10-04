"use client";

import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/client";
import { TEAM_PARAM } from "@/lib/routes";
import type { Team } from "@/lib/types";

import styles from "./Teams.module.css";

/**
 * Filtro por equipo como formulario GET (`?team=`): la página se renderiza en el servidor ya
 * filtrada y el enlace se puede compartir. Con JS se aplica al elegir; sin JS, con el botón.
 */
export function TeamFilter({ teams, selectedId }: { teams: Team[]; selectedId?: number }) {
  const t = useT();
  return (
    <form method="get" className={styles.filter}>
      <label className={styles.filterLabel}>
        {t.teams.filterLabel}
        <select
          name={TEAM_PARAM}
          className={styles.select}
          defaultValue={selectedId ?? ""}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="">{t.teams.allAthletes}</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>
      <noscript>
        <Button type="submit" variant="secondary">
          {t.teams.applyFilter}
        </Button>
      </noscript>
    </form>
  );
}
