import Link from "next/link";

import { GuideSection, Specimen } from "./GuideSection";
import { Button } from "../Button";
import { ConfirmDialog } from "../Dialog";
import { Checkbox, Switch, TextField } from "../Fields";
import { Glyph } from "../Glyph";
import { MovementPicker } from "../MovementPicker";
import { EmptyState, ErrorState, LoadingState } from "../States";
import { AiStatus, Notice } from "../Status";

import type { GlyphName } from "@/lib/design/icons";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

const card = "kin-card grid content-start gap-4 p-5 sm:p-6";

/** Vista previa de la navegación: las mismas pestañas de las pantallas, con la primera activa. */
function NavigationPreview({ tabs, label }: { tabs: { glyph: GlyphName; label: string; href: string }[]; label: string }) {
  return (
    <div className="grid gap-4">
      <nav aria-label={label} className="kin-well p-1.5">
        <ul className="flex flex-wrap gap-1">
          {tabs.map((tab, i) => (
            <li key={tab.href}>
              <Link href={tab.href} className={`inline-flex min-h-11 items-center gap-2 rounded-panel px-3 text-sm font-semibold ${i === 0 ? "bg-panel text-accent shadow-[0_2px_8px_-4px_var(--kin-shade)]" : "text-ink-muted hover:text-accent"}`}>
                <Glyph name={tab.glyph} size={18} />
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="kin-well flex justify-around p-1" aria-hidden>
        {tabs.map((tab, i) => (
          <span key={tab.href} className={`relative grid min-h-14 flex-1 place-items-center content-center gap-0.5 text-xs font-semibold ${i === 0 ? "text-accent after:absolute after:top-0 after:h-0.5 after:w-10 after:rounded-full after:bg-accent after:shadow-[0_0_10px_var(--kin-accent)]" : "text-ink-muted"}`}>
            <Glyph name={tab.glyph} size={22} />
            {tab.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export async function ComponentSection() {
  const t = await getT();
  const c = t.styleGuide.components;
  const tabs = [
    { glyph: "overview" as const, label: t.nav.home, href: ROUTES.styleGuideScreen("home") },
    { glyph: "history" as const, label: t.nav.analyses, href: ROUTES.styleGuideScreen("analysis") },
    { glyph: "capture" as const, label: t.styleGuide.screens.capture.title, href: ROUTES.styleGuideScreen("capture") },
  ];
  return (
    <GuideSection id="components" title={t.styleGuide.sections.components} lead={c.lead} tint="var(--kin-accent)">
      <div className="grid gap-5 lg:grid-cols-2">
        <Specimen title={c.buttons} className={card}>
          <div className="flex flex-wrap gap-3">
            <Button glyph="upload">{c.primary}</Button>
            <Button variant="secondary" glyph="history">{c.secondary}</Button>
            <Button variant="quiet">{c.quiet}</Button>
            <Button pending>{c.pending}</Button>
          </div>
        </Specimen>

        <Specimen title={c.fields} className={card}>
          <TextField label={c.email} hint={c.emailHint} type="email" autoComplete="email" name="guide-email" />
          <TextField label={c.email} error={c.emailError} type="email" defaultValue={c.emailInvalid} name="guide-email-invalid" />
          <Checkbox label={c.checkbox} defaultChecked name="guide-consent" />
          <Switch label={c.switch} defaultChecked name="guide-reminder" />
        </Specimen>

        <Specimen title={c.movement} className={`${card} lg:col-span-2`}>
          <MovementPicker
            legend={c.movementLegend}
            name="guide-movement"
            defaultValue="squat"
            options={[
              { value: "jump", label: t.analysis.movement.jump, hint: c.jumpHint },
              { value: "squat", label: t.analysis.movement.squat, hint: c.squatHint },
            ]}
          />
        </Specimen>

        <Specimen title={c.notices} className={card}>
          <Notice tone="info">{c.info}</Notice>
          <Notice tone="success">{c.success}</Notice>
          <Notice tone="warning">{c.warning}</Notice>
        </Specimen>

        <Specimen title={c.ai} className={card}>
          <div className="grid justify-items-start gap-3">
            <AiStatus state="waking" label={c.aiWaking} hint={c.aiWakingHint} />
            <AiStatus state="ready" label={c.aiReady} />
            <AiStatus state="unavailable" label={c.aiUnavailable} hint={c.aiUnavailableHint} />
          </div>
        </Specimen>

        <Specimen title={c.navigation} lead={c.navigationLead} className={card}>
          <NavigationPreview tabs={tabs} label={c.navigation} />
        </Specimen>

        <Specimen title={c.dialog} className={card}>
          <div><ConfirmDialog labels={{ open: c.dialogOpen, title: c.dialogTitle, body: c.dialogBody, confirm: c.dialogConfirm, cancel: c.dialogCancel }} /></div>
        </Specimen>

        <Specimen title={c.states} className="grid content-start gap-4 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            <EmptyState title={c.emptyTitle} body={c.emptyBody} action={<Button glyph="capture">{c.emptyAction}</Button>} />
            <LoadingState label={c.loading} />
            <ErrorState title={c.errorTitle} body={c.errorBody} action={<Button variant="secondary">{c.errorAction}</Button>} />
          </div>
        </Specimen>
      </div>
    </GuideSection>
  );
}
