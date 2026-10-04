import { StatGrid } from "@/components/analysis/StatGrid";
import { EmptyState } from "@/components/app/EmptyState";
import { Section } from "@/components/app/Section";
import { ButtonLink } from "@/components/ui/Button";
import { assignCoach, changeUserRole, setUserActive } from "@/lib/actions/admin";
import { NAV_BY_ROLE } from "@/lib/access";
import { accountStatus, systemSummary, unassignedFirst } from "@/lib/admin-stats";
import { listAllAthletes, listUsers } from "@/lib/data/admin";
import { format } from "@/lib/i18n";
import { getFormat, getLocale, getT } from "@/lib/i18n/server";
import { USER_ROLES } from "@/lib/types";

import { AccountStatusBadge } from "./AccountStatusBadge";
import styles from "./AdminData.module.css";
import { DataTable } from "./DataTable";
import { InlineActionButton } from "./InlineActionButton";
import { InlineSelectForm } from "./InlineSelectForm";


// Async Server Components que cada página del admin envuelve en <Suspense> (SSR streaming, §3)

const hrefOf = (key: string) => NAV_BY_ROLE.admin.find((item) => item.key === key)?.href;

export async function AdminOverview() {
  const t = await getT();
  // Las dos listas salen en paralelo (§10.2)
  const [users, athletes] = await Promise.all([listUsers(), listAllAthletes()]);
  const summary = systemSummary(users, athletes);
  const usersHref = hrefOf("users");
  const assignmentsHref = hrefOf("assignments");
  const teamsHref = hrefOf("teams");

  return (
    <>
      <Section title={t.admin.summary}>
        <StatGrid
          tiles={[
            { label: t.admin.users, value: String(summary.users) },
            { label: t.admin.coaches, value: String(summary.coaches) },
            { label: t.admin.athletes, value: String(summary.athletes) },
            { label: t.admin.unassigned, value: String(summary.unassigned) },
            { label: t.admin.pendingVerification, value: String(summary.pendingVerification) },
          ]}
        />
      </Section>
      <Section title={t.admin.shortcuts}>
        <div className={styles.shortcuts}>
          {usersHref && (
            <ButtonLink href={usersHref} variant="secondary">
              {t.admin.manageUsers}
            </ButtonLink>
          )}
          {assignmentsHref && (
            <ButtonLink href={assignmentsHref} variant="secondary">
              {t.admin.manageAssignments}
            </ButtonLink>
          )}
          {teamsHref && (
            <ButtonLink href={teamsHref} variant="secondary">
              {t.admin.manageTeams}
            </ButtonLink>
          )}
        </div>
      </Section>
    </>
  );
}

/** Todas las cuentas, con cambio de rol y activación. La propia cuenta no tiene acciones (el backend
 * tampoco las permite): así ningún admin se deja al sistema sin administradores. */
export async function UsersTable({ currentUserId }: { currentUserId: number }) {
  const t = await getT();
  const roleOptions = USER_ROLES.map((role) => ({ value: role, label: t.roles[role] }));
  const fmt = await getFormat();
  const users = await listUsers();
  if (users.length === 0) return <EmptyState icon="users" title={t.admin.usersEmpty} />;
  return (
    <DataTable
      caption={t.admin.users}
      columns={[
        { key: "name", label: t.admin.columns.name },
        { key: "email", label: t.admin.columns.email },
        { key: "role", label: t.admin.columns.role },
        { key: "status", label: t.admin.columns.status },
        { key: "createdAt", label: t.admin.columns.createdAt },
        { key: "actions", label: t.admin.columns.actions },
      ]}
      rows={users.map((user) => {
        const isSelf = user.id === currentUserId;
        return {
          key: user.id,
          cells: {
            name: user.full_name,
            email: <span className={styles.email}>{user.email}</span>,
            role: isSelf ? (
              t.roles[user.role]
            ) : (
              <InlineSelectForm
                name="role"
                label={format(t.admin.roleFor, { name: user.full_name })}
                options={roleOptions}
                defaultValue={user.role}
                action={changeUserRole.bind(null, user.id)}
              />
            ),
            status: <AccountStatusBadge status={accountStatus(user)} />,
            createdAt: fmt.dateTime(user.created_at),
            actions: isSelf ? (
              <span className={styles.note}>{t.admin.yourAccount}</span>
            ) : (
              <InlineActionButton
                label={user.is_active ? t.admin.deactivate : t.admin.activate}
                action={setUserActive.bind(null, user.id, !user.is_active)}
              />
            ),
          },
        };
      })}
    />
  );
}

export async function AssignmentsTable() {
  const t = await getT();
  const locale = await getLocale();
  const [users, athletes] = await Promise.all([listUsers(), listAllAthletes()]);
  if (athletes.length === 0) return <EmptyState icon="users" title={t.admin.athletesEmpty} />;
  const coaches = users.filter((user) => user.role === "coach");
  const coachOptions = coaches.map((coach) => ({ value: String(coach.id), label: coach.full_name }));

  return (
    <>
      <p className={styles.note}>{t.admin.unassignedFirst}</p>
      <DataTable
        caption={t.nav.assignments}
        columns={[
          { key: "athlete", label: t.admin.columns.athlete },
          { key: "type", label: t.admin.columns.type },
          { key: "coach", label: t.admin.columns.coach },
        ]}
        rows={unassignedFirst(athletes, locale).map((athlete) => ({
          key: athlete.id,
          cells: {
            athlete: athlete.display_name,
            type: athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount,
            coach: (
              <>
                {athlete.coach_id === null && <span className={styles.unassigned}>{t.admin.noCoach}</span>}
                {coaches.length === 0 ? (
                  <span className={styles.note}>{t.admin.noCoachesYet}</span>
                ) : (
                  <InlineSelectForm
                    name="coach_id"
                    label={format(t.admin.coachFor, { name: athlete.display_name })}
                    options={coachOptions}
                    defaultValue={athlete.coach_id === null ? undefined : String(athlete.coach_id)}
                    placeholder={t.admin.chooseCoach}
                    action={assignCoach.bind(null, athlete.id)}
                  />
                )}
              </>
            ),
          },
        }))}
      />
    </>
  );
}
