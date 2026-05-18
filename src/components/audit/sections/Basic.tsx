"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type {
  AiMoment,
  DeliverableCardData,
  DownloadItem,
  Hero,
  JourneyStage,
  PrototypeCta,
} from "@/lib/api/audits";
import { AUDIT_STATUSES } from "@/lib/api/audits";
import { Grid, RepeatableList, type AuditMeta } from "../_kit";
import { nextRefId } from "../defaults";

export function MetaSection({
  value,
  onChange,
  errors,
}: {
  value: AuditMeta;
  onChange: (v: AuditMeta) => void;
  errors: Record<string, string[]>;
}) {
  const set = <K extends keyof AuditMeta>(k: K, v: AuditMeta[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <Grid cols={2}>
      <Field
        label="Slug"
        required
        hint="Lowercase letters, numbers, hyphens. This is the public URL: /audit/<slug>."
        error={errors.slug?.[0]}
      >
        <Input
          value={value.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="acme-co"
        />
      </Field>
      <Field label="Client name" required error={errors.client_name?.[0]}>
        <Input
          value={value.client_name}
          onChange={(e) => set("client_name", e.target.value)}
        />
      </Field>
      <Field label="Industry">
        <Input
          value={value.industry}
          onChange={(e) => set("industry", e.target.value)}
        />
      </Field>
      <Field label="Status" required error={errors.status?.[0]}>
        <Select
          value={value.status}
          onChange={(e) =>
            set("status", e.target.value as AuditMeta["status"])
          }
        >
          {AUDIT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Started on">
        <Input
          type="date"
          value={value.started_on}
          onChange={(e) => set("started_on", e.target.value)}
        />
      </Field>
      <Field label="Completed on">
        <Input
          type="date"
          value={value.completed_on}
          onChange={(e) => set("completed_on", e.target.value)}
        />
      </Field>
    </Grid>
  );
}

export function HeroSection({
  value,
  onChange,
}: {
  value: Hero;
  onChange: (v: Hero) => void;
}) {
  const set = <K extends keyof Hero>(k: K, v: Hero[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Grid cols={2}>
        <Field label="Eyebrow">
          <Input value={value.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
        </Field>
        <Field label="Client name (display)">
          <Input
            value={value.client_name}
            onChange={(e) => set("client_name", e.target.value)}
          />
        </Field>
        <Field label="Audit started label" hint="e.g. Audit started April 2026">
          <Input
            value={value.audit_started_label}
            onChange={(e) => set("audit_started_label", e.target.value)}
          />
        </Field>
      </Grid>
      <Grid cols={2}>
        <Field label="Status pill label">
          <Input
            value={value.status_pill.label}
            onChange={(e) =>
              set("status_pill", { ...value.status_pill, label: e.target.value })
            }
          />
        </Field>
        <Field label="Status pill tone">
          <Select
            value={value.status_pill.tone}
            onChange={(e) =>
              set("status_pill", {
                ...value.status_pill,
                tone: e.target.value as Hero["status_pill"]["tone"],
              })
            }
          >
            <option value="success">success</option>
            <option value="active">active</option>
            <option value="neutral">neutral</option>
          </Select>
        </Field>
      </Grid>
    </div>
  );
}

export function AiMomentSection({
  value,
  onChange,
}: {
  value: AiMoment;
  onChange: (v: AiMoment) => void;
}) {
  const set = <K extends keyof AiMoment>(k: K, v: AiMoment[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Grid cols={2}>
        <Field label="Label">
          <Input value={value.label} onChange={(e) => set("label", e.target.value)} />
        </Field>
        <Field label="Heading">
          <Input value={value.heading} onChange={(e) => set("heading", e.target.value)} />
        </Field>
      </Grid>
      <Field label="Sub">
        <Textarea value={value.sub} onChange={(e) => set("sub", e.target.value)} />
      </Field>
      <Grid cols={2}>
        <Field label="Analogy title">
          <Input
            value={value.analogy_callout.title}
            onChange={(e) =>
              set("analogy_callout", { ...value.analogy_callout, title: e.target.value })
            }
          />
        </Field>
        <Field label="Analogy body">
          <Textarea
            value={value.analogy_callout.body}
            onChange={(e) =>
              set("analogy_callout", { ...value.analogy_callout, body: e.target.value })
            }
          />
        </Field>
      </Grid>
      <div>
        <p className="mb-2 text-[13px] font-medium text-foreground">Explainer cards</p>
        <RepeatableList
          items={value.explainer}
          onChange={(v) => set("explainer", v)}
          make={() => ({ icon: "", title: "", body: "" })}
          addLabel="Add explainer"
          itemLabel={(_, i) => `Card ${i + 1}`}
          renderRow={(it, _i, update) => (
            <Grid cols={3}>
              <Field label="Icon key">
                <Input value={it.icon} onChange={(e) => update({ icon: e.target.value })} />
              </Field>
              <Field label="Title">
                <Input value={it.title} onChange={(e) => update({ title: e.target.value })} />
              </Field>
              <Field label="Body">
                <Textarea value={it.body} onChange={(e) => update({ body: e.target.value })} />
              </Field>
            </Grid>
          )}
        />
      </div>
      <Field label="Diagram caption">
        <Textarea
          value={value.diagram.caption}
          onChange={(e) =>
            set("diagram", { ...value.diagram, caption: e.target.value })
          }
        />
      </Field>
      <Grid cols={2}>
        <div>
          <p className="mb-2 text-[13px] font-medium text-foreground">Silos (before)</p>
          <RepeatableList
            items={value.diagram.silos}
            onChange={(v) => set("diagram", { ...value.diagram, silos: v })}
            make={() => ({ label: "" })}
            addLabel="Add silo"
            itemLabel={(_, i) => `Silo ${i + 1}`}
            renderRow={(it, _i, update) => (
              <Field label="Label">
                <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
              </Field>
            )}
          />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium text-foreground">Connected (after)</p>
          <RepeatableList
            items={value.diagram.connected}
            onChange={(v) => set("diagram", { ...value.diagram, connected: v })}
            make={() => ({ label: "" })}
            addLabel="Add node"
            itemLabel={(_, i) => `Node ${i + 1}`}
            renderRow={(it, _i, update) => (
              <Field label="Label">
                <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
              </Field>
            )}
          />
        </div>
      </Grid>
    </div>
  );
}

export function JourneySection({
  value,
  onChange,
}: {
  value: JourneyStage[];
  onChange: (v: JourneyStage[]) => void;
}) {
  return (
    <RepeatableList
      items={value}
      onChange={onChange}
      make={(ex): JourneyStage => ({
        id: nextRefId("STAGE", ex.map((s) => s.id), 1),
        label: "",
        state: "upcoming",
        sub: "",
      })}
      addLabel="Add stage"
      itemLabel={(it) => it.id || "Stage"}
      renderRow={(it, _i, update) => (
        <Grid cols={2}>
          <Field label="Id">
            <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
          </Field>
          <Field label="Label">
            <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
          </Field>
          <Field label="State">
            <Select
              value={it.state}
              onChange={(e) =>
                update({ state: e.target.value as JourneyStage["state"] })
              }
            >
              <option value="done">done</option>
              <option value="active">active</option>
              <option value="upcoming">upcoming</option>
            </Select>
          </Field>
          <Field label="Sub">
            <Input value={it.sub} onChange={(e) => update({ sub: e.target.value })} />
          </Field>
        </Grid>
      )}
    />
  );
}

export function FooterSection({
  value,
  onChange,
}: {
  value: { note: string };
  onChange: (v: { note: string }) => void;
}) {
  return (
    <Field label="Footer note">
      <Input value={value.note} onChange={(e) => onChange({ note: e.target.value })} />
    </Field>
  );
}

export function PrototypeSection({
  value,
  onChange,
}: {
  value: PrototypeCta;
  onChange: (v: PrototypeCta) => void;
}) {
  const set = <K extends keyof PrototypeCta>(k: K, v: PrototypeCta[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Grid cols={2}>
        <Field label="Heading">
          <Input value={value.heading} onChange={(e) => set("heading", e.target.value)} />
        </Field>
        <Field label="CTA label">
          <Input value={value.cta_label} onChange={(e) => set("cta_label", e.target.value)} />
        </Field>
      </Grid>
      <Field label="Sub">
        <Textarea value={value.sub} onChange={(e) => set("sub", e.target.value)} />
      </Field>
      <Grid cols={2}>
        <Field label="URL" hint="Leave blank to hide the prototype banner.">
          <Input
            value={value.url ?? ""}
            onChange={(e) => set("url", e.target.value || null)}
          />
        </Field>
        <Field label="Enabled">
          <Select
            value={value.enabled ? "yes" : "no"}
            onChange={(e) => set("enabled", e.target.value === "yes")}
          >
            <option value="no">no</option>
            <option value="yes">yes</option>
          </Select>
        </Field>
      </Grid>
    </div>
  );
}

export function DeliverablesSection({
  value,
  onChange,
}: {
  value: DeliverableCardData[];
  onChange: (v: DeliverableCardData[]) => void;
}) {
  return (
    <RepeatableList
      items={value}
      onChange={onChange}
      make={(): DeliverableCardData => ({
        key: "process-map",
        heading: "",
        sub: "",
        state: "available",
        cta_label: "",
        locked_tooltip: null,
      })}
      addLabel="Add deliverable card"
      itemLabel={(it) => it.key}
      renderRow={(it, _i, update) => (
        <div className="space-y-3">
          <Grid cols={2}>
            <Field label="Key">
              <Select
                value={it.key}
                onChange={(e) =>
                  update({ key: e.target.value as DeliverableCardData["key"] })
                }
              >
                <option value="process-map">process-map</option>
                <option value="findings">findings</option>
                <option value="waste">waste</option>
                <option value="blueprint">blueprint</option>
                <option value="comprehensive-report">comprehensive-report</option>
              </Select>
            </Field>
            <Field label="State">
              <Select
                value={it.state}
                onChange={(e) =>
                  update({ state: e.target.value as DeliverableCardData["state"] })
                }
              >
                <option value="available">available</option>
                <option value="locked">locked</option>
              </Select>
            </Field>
            <Field label="Heading">
              <Input value={it.heading} onChange={(e) => update({ heading: e.target.value })} />
            </Field>
            <Field label="CTA label">
              <Input value={it.cta_label} onChange={(e) => update({ cta_label: e.target.value })} />
            </Field>
          </Grid>
          <Field label="Sub">
            <Textarea value={it.sub} onChange={(e) => update({ sub: e.target.value })} />
          </Field>
          <Field label="Locked tooltip" hint="Shown only when state is locked.">
            <Input
              value={it.locked_tooltip ?? ""}
              onChange={(e) => update({ locked_tooltip: e.target.value || null })}
            />
          </Field>
        </div>
      )}
    />
  );
}

export function DownloadsSection({
  value,
  onChange,
}: {
  value: DownloadItem[];
  onChange: (v: DownloadItem[]) => void;
}) {
  return (
    <RepeatableList
      items={value}
      onChange={onChange}
      make={(): DownloadItem => ({
        title: "",
        description: "",
        deliverable_key: "process-map",
        format_label: "Web document",
      })}
      addLabel="Add download"
      itemLabel={(it) => it.title || "Download"}
      renderRow={(it, _i, update) => (
        <div className="space-y-3">
          <Grid cols={2}>
            <Field label="Title">
              <Input value={it.title} onChange={(e) => update({ title: e.target.value })} />
            </Field>
            <Field label="Links to deliverable">
              <Select
                value={it.deliverable_key}
                onChange={(e) =>
                  update({
                    deliverable_key: e.target.value as DownloadItem["deliverable_key"],
                  })
                }
              >
                <option value="process-map">process-map</option>
                <option value="findings">findings</option>
                <option value="waste">waste</option>
                <option value="blueprint">blueprint</option>
                <option value="comprehensive-report">comprehensive-report</option>
              </Select>
            </Field>
            <Field label="Format label">
              <Input
                value={it.format_label}
                onChange={(e) => update({ format_label: e.target.value })}
              />
            </Field>
          </Grid>
          <Field label="Description">
            <Textarea
              value={it.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </Field>
        </div>
      )}
    />
  );
}
