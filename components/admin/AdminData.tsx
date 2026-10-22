import Link from "next/link";

import { Avatar } from "@/components/app/Avatar";
import { ButtonLink } from "@/components/instrument/Button";
import { CountUp } from "@/components/instrument/CountUp";
import { Dial } from "@/components/instrument/Dial";
import { EmptyState } from "@/components/instrument/States";
import { assignCoach, changeUserRole, setUserActive } from "@/lib/actions/admin";
import { NAV_BY_ROLE } from "@/lib/access";
import { accountStatus, systemSummary, unassignedFirst } from "@/lib/admin-stats";
import { cssVars } from "@/lib/design/css";
import { SIGNAL_CLASS } from "@/lib/design/signals";
import { listAllAthletes, listUsers } from "@/lib/data/admin";
import { format, plural } from "@/lib/i18n";
import { getFormat, getLocale, getT } from "@/lib/i18n/server";
import { USER_ROLES } from "@/lib/types";

import { AccountStatusBadge } from "./AccountStatusBadge";
import { InlineActionButton } from "./InlineActionButton";
import { InlineSelectForm } from "./InlineSelectForm";

// Async Server Components que cada página del admin envuelve en <Suspense>: el encabezado sale de
// inmediato y estos bloques llegan después, en otro chunk del mismo stream HTTP

const PENDING_COUNT = 5;
const PERCENT = 100;
const card = "kin-card grid content-start gap-5 p-5 sm:p-6";
const sectionTitle = "font-display text-xl font-semibold text-ink";
const list = "kin-card divide-y divide-line overflow-hidden";
const hrefOf = (key: string) => NAV_BY_ROLE.admin.find((item) => item.key === key)!.href;

// Cada rol con una señal de la guía: deportistas en el color de la rodilla, entrenadores en el del tronco
const ROLE_SIGNAL = { athlete: "knee", coach: "trunk", admin: "hip" } as const;

/** Las dos listas salen en paralelo y se esperan juntas. */
async function systemData() {
  const [users, athletes] = await Promise.all([listUsers(), listAllAthletes()]);
  return { users, athletes, summary: systemSummary(users, athletes) };
}

/** Frase de bienvenida: lo que queda por atender. */
export async function AdminLead() {
  const t = await getT();
  const { summary } = await systemData();
  const text = summary.unassigned ? plural(t.adminHome.lead.pending, summary.unassigned, { users: summary.users }) : format(t.adminHome.lead.clear, { users: summary.users });
  return <p className="max-w-prose text-lg text-ink-muted">{text}</p>;
}

/** Inicio del admin: composición por rol, cobertura de entrenador, estado de las cuentas y lo pendiente. */
export async function AdminOverview() {
  const [t, f, locale] = await Promise.all([getT(), getFormat(), getLocale()]);
  const h = t.adminHome;
  const { users, athletes, summary } = await systemData();
  const roles = USER_ROLES.map((role) => ({ role, count: { athlete: summary.athleteAccounts, coach: summary.coaches, admin: summary.admins }[role] }));
  const covered = summary.athletes - summary.unassigned;
  const coverage = summary.athletes ? covered / summary.athletes : null;
  const statuses = [
    { status: "active" as const, count: summary.users - summary.pendingVerification - summary.disabled },
    { status: "unverified" as const, count: summary.pendingVerification },
    { status: "disabled" as const, count: summary.disabled },
  ];
  const pending = unassignedFirst(athletes, locale).filter((athlete) => athlete.coach_id === null).slice(0, PENDING_COUNT);
  const unverified = users.filter((user) => accountStatus(user) === "unverified");

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="admin-coverage" className={`${card} kin-tinted`} style={cssVars({ "--tint": "var(--kin-center)" })}>
          <div className="grid gap-1">
            <h2 id="admin-coverage" className={sectionTitle}>{h.coverage}</h2>
            <p className="text-sm text-ink-muted">{h.coverageLead}</p>
          </div>
          <Dial
            value={(coverage ?? 0) * PERCENT}
            max={PERCENT}
            signal="center"
            labelStep={25}
            labels
            sweep={coverage !== null}
            label={coverage === null ? t.admin.athletesEmpty : format(h.coverageLabel, { value: f.percent(coverage), covered, total: summary.athletes })}
            className="mx-auto w-full max-w-[16rem]"
          >
            {coverage !== null ? (
              <>
                <CountUp value={coverage * PERCENT} text={f.percent(coverage)} className={`font-display text-3xl font-bold ${SIGNAL_CLASS.center.text}`} />
                <span className="text-sm font-semibold text-ink-muted">{format(h.coverageCount, { covered, total: summary.athletes })}</span>
              </>
            ) : (
              <span className="px-6 text-sm text-ink-muted">{t.admin.athletesEmpty}</span>
            )}
          </Dial>
          <dl className="grid grid-cols-2 gap-3">
            <div className="kin-well grid gap-1 p-3">
              <dt className="text-xs text-ink-muted">{t.admin.athletes}</dt>
              <dd className="font-display text-3xl font-semibold text-ink"><CountUp value={summary.athletes} text={String(summary.athletes)} /></dd>
            </div>
            <div className="kin-well grid gap-1 p-3">
              <dt className="text-xs text-ink-muted">{t.admin.unassigned}</dt>
              <dd className="font-display text-3xl font-semibold text-ink"><CountUp value={summary.unassigned} text={String(summary.unassigned)} delayMs={90} /></dd>
            </div>
          </dl>
        </section>

        <div className="grid content-start gap-6">
          <section aria-labelledby="admin-roles" className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 id="admin-roles" className={sectionTitle}>{h.roles}</h2>
              <Link href={hrefOf("users")} className="text-sm font-semibold">{t.admin.manageUsers}</Link>
            </div>
            {/* La barra es decorativa: los mismos números van escritos en los pozos de abajo */}
            <div className="kin-well flex h-4 gap-1 overflow-hidden rounded-full p-0.5" aria-hidden>
              {roles.filter(({ count }) => count > 0).map(({ role, count }, i) => (
                <span key={role} className={`kin-light rounded-full ${SIGNAL_CLASS[ROLE_SIGNAL[role]].bg}`} style={{ ...cssVars({ "--i": i }), flexGrow: count }} />
              ))}
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
              {roles.map(({ role, count }, i) => (
                <div key={role} className="kin-well grid gap-1 p-3">
                  <dt className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <span className={`size-2 rounded-full ${SIGNAL_CLASS[ROLE_SIGNAL[role]].bg}`} aria-hidden />
                    {h.roleCount[role]}
                  </dt>
                  <dd className="font-display text-3xl font-semibold text-ink"><CountUp value={count} text={String(count)} delayMs={i * 90} /></dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="admin-status" className={card}>
            <h2 id="admin-status" className={sectionTitle}>{h.status}</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {statuses.map(({ status, count }) => (
                <li key={status} className="flex items-center gap-3">
                  <span className="font-display text-3xl font-semibold text-ink [font-variant-numeric:tabular-nums]">{count}</span>
                  <AccountStatusBadge status={status} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="admin-pending" className="grid content-start gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 id="admin-pending" className={sectionTitle}>{h.pendingTitle}</h2>
            {summary.unassigned > 0 && <Link href={hrefOf("assignments")} className="text-sm font-semibold">{t.admin.manageAssignments}</Link>}
          </div>
          {pending.length === 0 ? (
            <EmptyState title={h.pendingEmpty} body={h.pendingEmptyBody} />
          ) : (
            <ul className={list}>
              {pending.map((athlete) => (
                <li key={athlete.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} />
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate font-semibold text-ink">{athlete.display_name}</span>
                    <span className="text-sm text-ink-muted">{athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount}</span>
                  </span>
                  <NoCoachChip label={t.admin.noCoach} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="admin-unverified" className="grid content-start gap-3">
          <h2 id="admin-unverified" className={sectionTitle}>{h.unverifiedTitle}</h2>
          {unverified.length === 0 ? (
            <EmptyState title={h.unverifiedEmpty} body={h.unverifiedEmptyBody} />
          ) : (
            <ul className={list}>
              {unverified.slice(0, PENDING_COUNT).map((user) => (
                <li key={user.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={user.full_name} imageUrl={user.avatar_url} />
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate font-semibold text-ink">{user.full_name}</span>
                    <span className="truncate text-sm text-ink-muted">{`${t.roles[user.role]} · ${f.shortDate(user.created_at)}`}</span>
                  </span>
                  <AccountStatusBadge status="unverified" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="admin-shortcuts" className="flex flex-wrap gap-3">
        <h2 id="admin-shortcuts" className="visually-hidden">{t.admin.shortcuts}</h2>
        <ButtonLink href={hrefOf("users")} variant="secondary" glyph="roles">{t.admin.manageUsers}</ButtonLink>
        <ButtonLink href={hrefOf("assignments")} variant="secondary" glyph="link">{t.admin.manageAssignments}</ButtonLink>
        <ButtonLink href={hrefOf("teams")} variant="secondary" glyph="team">{t.admin.manageTeams}</ButtonLink>
      </section>
    </>
  );
}

/** "Sin entrenador": el mismo punto del estado, en el ámbar de lo que requiere acción. */
function NoCoachChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-trunk-soft px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-trunk">
      <span className="size-2 rounded-full bg-trunk" aria-hidden />
      {label}
    </span>
  );
}

/** Todas las cuentas, con cambio de rol y activación. La propia cuenta no tiene acciones (el backend
 * tampoco las permite): así ningún admin se deja al sistema sin administradores. */
export async function UsersTable({ currentUserId }: { currentUserId: string }) {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const roleOptions = USER_ROLES.map((role) => ({ value: role, label: t.roles[role] }));
  const users = await listUsers();
  if (users.length === 0) return <EmptyState title={t.admin.usersEmpty} body={t.admin.usersSubtitle} />;
  return (
    <ul className={list} aria-label={t.admin.users}>
      {users.map((user, i) => {
        const isSelf = user.id === currentUserId;
        return (
          <li key={user.id} className="kin-rise grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-5 lg:grid-cols-[auto_minmax(0,1fr)_8rem_16rem_9rem]" style={cssVars({ "--i": Math.min(i, 8) })}>
            <span className="relative">
              <Avatar name={user.full_name} imageUrl={user.avatar_url} />
              <span className={`absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-panel ${SIGNAL_CLASS[ROLE_SIGNAL[user.role]].bg}`} aria-hidden />
            </span>
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate font-semibold text-ink">{user.full_name}</span>
              <span className="text-sm text-ink-muted [overflow-wrap:anywhere]">{user.email}</span>
              <span className="text-xs text-ink-muted">{format(t.admin.since, { date: f.shortDate(user.created_at) })}</span>
            </span>
            <span className="col-start-2 lg:col-start-auto"><AccountStatusBadge status={accountStatus(user)} /></span>
            <span className="col-span-full lg:col-span-1">
              {isSelf ? (
                <span className="text-sm font-semibold text-ink">{t.roles[user.role]}</span>
              ) : (
                <InlineSelectForm name="role" label={format(t.admin.roleFor, { name: user.full_name })} options={roleOptions} defaultValue={user.role} action={changeUserRole.bind(null, user.id)} />
              )}
            </span>
            <span className="col-span-full lg:col-span-1 lg:justify-self-end">
              {isSelf ? (
                <span className="text-sm text-ink-muted">{t.admin.yourAccount}</span>
              ) : (
                <InlineActionButton
                  label={user.is_active ? t.admin.deactivate : t.admin.activate}
                  glyph={user.is_active ? "lock" : "check"}
                  action={setUserActive.bind(null, user.id, !user.is_active)}
                />
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Entrenador de cada deportista; los que no tienen van primero porque son los que requieren acción. */
export async function AssignmentsTable() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const [users, athletes] = await Promise.all([listUsers(), listAllAthletes()]);
  if (athletes.length === 0) return <EmptyState title={t.admin.athletesEmpty} body={t.admin.assignmentsSubtitle} />;
  const coaches = users.filter((user) => user.role === "coach");
  const coachOptions = coaches.map((coach) => ({ value: String(coach.id), label: coach.full_name }));

  return (
    <ul className={list} aria-label={t.nav.assignments}>
      {unassignedFirst(athletes, locale).map((athlete, i) => (
        <li key={athlete.id} className="kin-rise grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-5 md:grid-cols-[auto_minmax(0,1fr)_auto]" style={cssVars({ "--i": Math.min(i, 8) })}>
          <Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} />
          <span className="grid min-w-0 gap-1">
            <span className="truncate font-semibold text-ink">{athlete.display_name}</span>
            <span className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              {athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount}
              {athlete.coach_id === null && <NoCoachChip label={t.admin.noCoach} />}
            </span>
          </span>
          <span className="col-span-full md:col-span-1">
            {coaches.length === 0 ? (
              <span className="text-sm text-ink-muted">{t.admin.noCoachesYet}</span>
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
          </span>
        </li>
      ))}
    </ul>
  );
}
