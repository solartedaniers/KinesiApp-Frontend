import { StatGrid } from "@/components/analysis/StatGrid";
import { EmptyState } from "@/components/app/EmptyState";
import { Section } from "@/components/app/Section";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_BY_ROLE } from "@/lib/access";
import { accountStatus, systemSummary, unassignedFirst } from "@/lib/admin-stats";
import { listAllAthletes, listUsers } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/format";
import { LOCALE, t } from "@/lib/i18n";

import { AccountStatusBadge } from "./AccountStatusBadge";
import styles from "./AdminData.module.css";
import { DataTable } from "./DataTable";

// Async Server Components que cada página del admin envuelve en <Suspense> (SSR streaming, §3)

const hrefOf = (key: string) => NAV_BY_ROLE.admin.find((item) => item.key === key)?.href;

export async function AdminOverview() {
  // Las dos listas salen en paralelo (§10.2)
  const [users, athletes] = await Promise.all([listUsers(), listAllAthletes()]);
  const summary = systemSummary(users, athletes);
  const usersHref = hrefOf("users");
  const assignmentsHref = hrefOf("assignments");

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
        </div>
      </Section>
    </>
  );
}

export async function UsersTable() {
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
      ]}
      rows={users.map((user) => ({
        key: user.id,
        cells: {
          name: user.full_name,
          email: <span className={styles.email}>{user.email}</span>,
          role: t.roles[user.role],
          status: <AccountStatusBadge status={accountStatus(user)} />,
          createdAt: formatDateTime(user.created_at),
        },
      }))}
    />
  );
}

export async function AssignmentsTable() {
  const [users, athletes] = await Promise.all([listUsers(), listAllAthletes()]);
  if (athletes.length === 0) return <EmptyState icon="users" title={t.admin.athletesEmpty} />;
  const coachNames = new Map(users.filter((user) => user.role === "coach").map((coach) => [coach.id, coach.full_name]));

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
        rows={unassignedFirst(athletes, LOCALE).map((athlete) => ({
          key: athlete.id,
          cells: {
            athlete: athlete.display_name,
            type: athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount,
            coach:
              athlete.coach_id === null ? (
                <span className={styles.unassigned}>{t.admin.noCoach}</span>
              ) : (
                coachNames.get(athlete.coach_id) ?? t.admin.noCoach
              ),
          },
        }))}
      />
    </>
  );
}
