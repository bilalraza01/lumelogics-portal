"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type { Blueprint, BlueprintOpportunity } from "@/lib/api/audits";
import {
  Grid,
  RefMultiSelect,
  RefSelect,
  RepeatableList,
  type AuditRefs,
} from "../_kit";
import { nextRefId } from "../defaults";
import { NumberField, QuoteEditor } from "../fields";

export function BlueprintSection({
  value,
  onChange,
  refs,
}: {
  value: Blueprint;
  onChange: (v: Blueprint) => void;
  refs: AuditRefs;
}) {
  const set = <K extends keyof Blueprint>(k: K, v: Blueprint[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-5">
      <Field label="Intro">
        <Textarea value={value.intro} onChange={(e) => set("intro", e.target.value)} />
      </Field>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">Exec KPIs</p>
        <RepeatableList
          items={value.exec_kpis}
          onChange={(v) => set("exec_kpis", v)}
          make={() => ({ label: "", value: "", sub: "" })}
          addLabel="Add KPI"
          itemLabel={(it) => it.label || "KPI"}
          renderRow={(it, _i, update) => (
            <Grid cols={3}>
              <Field label="Label">
                <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
              </Field>
              <Field label="Value">
                <Input value={it.value} onChange={(e) => update({ value: e.target.value })} />
              </Field>
              <Field label="Sub">
                <Input value={it.sub} onChange={(e) => update({ sub: e.target.value })} />
              </Field>
            </Grid>
          )}
        />
      </div>

      <Grid cols={2}>
        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">
            Framework layers
          </p>
          <RepeatableList
            items={value.framework_layers}
            onChange={(v) => set("framework_layers", v)}
            make={(ex) => ({
              id: nextRefId("LAYER", ex.map((l) => l.id), 1),
              label: "",
              description: "",
            })}
            addLabel="Add layer"
            itemLabel={(it) => `${it.id} ${it.label}`}
            renderRow={(it, _i, update) => (
              <div className="space-y-2">
                <Field label="Id">
                  <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
                </Field>
                <Field label="Label">
                  <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
                </Field>
                <Field label="Description">
                  <Textarea
                    value={it.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </Field>
              </div>
            )}
          />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">Domains</p>
          <RepeatableList
            items={value.domains}
            onChange={(v) => set("domains", v)}
            make={(ex) => ({
              id: nextRefId("DOM", ex.map((d) => d.id), 1),
              label: "",
            })}
            addLabel="Add domain"
            itemLabel={(it) => `${it.id} ${it.label}`}
            renderRow={(it, _i, update) => (
              <Grid cols={2}>
                <Field label="Id">
                  <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
                </Field>
                <Field label="Label">
                  <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
                </Field>
              </Grid>
            )}
          />
        </div>
      </Grid>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">
          Solution types
        </p>
        <RepeatableList
          items={value.solution_types}
          onChange={(v) => set("solution_types", v)}
          make={(ex) => ({
            id: nextRefId("ST", ex.map((s) => s.id), 1),
            label: "",
            description: "",
            typical_timeline: "",
            color_token: "brand",
          })}
          addLabel="Add solution type"
          itemLabel={(it) => `${it.id} ${it.label}`}
          renderRow={(it, _i, update) => (
            <div className="space-y-2">
              <Grid cols={3}>
                <Field label="Id">
                  <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
                </Field>
                <Field label="Label">
                  <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
                </Field>
                <Field label="Typical timeline">
                  <Input
                    value={it.typical_timeline}
                    onChange={(e) => update({ typical_timeline: e.target.value })}
                  />
                </Field>
              </Grid>
              <Grid cols={2}>
                <Field label="Color token" hint="brand | success | info | muted">
                  <Input
                    value={it.color_token}
                    onChange={(e) => update({ color_token: e.target.value })}
                  />
                </Field>
                <Field label="Description">
                  <Input
                    value={it.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </Field>
              </Grid>
            </div>
          )}
        />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">
          Opportunities
        </p>
        <RepeatableList
          items={value.opportunities}
          onChange={(v) => set("opportunities", v)}
          make={(ex): BlueprintOpportunity => ({
            ref_id: nextRefId("S", ex.map((o) => o.ref_id), 3),
            title: "",
            summary: "",
            annual_value: 0,
            build_cost_min: 0,
            build_cost_max: 0,
            payback_months: 0,
            timeline_weeks: 0,
            solution_type: "",
            risk_level: "low",
            risk_description: "",
            problems_solved: [],
            waste_eliminated: [],
            methodology: "",
            dev_hours: 0,
            pm_hours: 0,
            confidence: "MEDIUM",
            domains: [],
            layers: [],
            quote: null,
          })}
          addLabel="Add opportunity"
          itemLabel={(it) => `${it.ref_id} ${it.title}`}
          renderRow={(it, _i, update) => (
            <div className="space-y-3">
              <Grid cols={2}>
                <Field label="Ref id">
                  <Input value={it.ref_id} onChange={(e) => update({ ref_id: e.target.value })} />
                </Field>
                <Field label="Title">
                  <Input value={it.title} onChange={(e) => update({ title: e.target.value })} />
                </Field>
              </Grid>
              <Field label="Summary">
                <Textarea value={it.summary} onChange={(e) => update({ summary: e.target.value })} />
              </Field>
              <Grid cols={3}>
                <NumberField label="Annual value ($)" value={it.annual_value} onChange={(n) => update({ annual_value: n })} />
                <NumberField label="Build cost min ($)" value={it.build_cost_min} onChange={(n) => update({ build_cost_min: n })} />
                <NumberField label="Build cost max ($)" value={it.build_cost_max} onChange={(n) => update({ build_cost_max: n })} />
                <NumberField label="Payback months" step="0.1" value={it.payback_months} onChange={(n) => update({ payback_months: n })} />
                <NumberField label="Timeline weeks" value={it.timeline_weeks} onChange={(n) => update({ timeline_weeks: n })} />
                <NumberField label="Dev hours" value={it.dev_hours} onChange={(n) => update({ dev_hours: n })} />
                <NumberField label="PM hours" value={it.pm_hours} onChange={(n) => update({ pm_hours: n })} />
                <Field label="Confidence">
                  <Select
                    value={it.confidence}
                    onChange={(e) =>
                      update({ confidence: e.target.value as BlueprintOpportunity["confidence"] })
                    }
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </Select>
                </Field>
                <Field label="Risk level">
                  <Select
                    value={it.risk_level}
                    onChange={(e) =>
                      update({ risk_level: e.target.value as BlueprintOpportunity["risk_level"] })
                    }
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </Select>
                </Field>
              </Grid>
              <Field label="Risk description">
                <Textarea
                  value={it.risk_description}
                  onChange={(e) => update({ risk_description: e.target.value })}
                />
              </Field>
              <Field label="Methodology">
                <Textarea
                  value={it.methodology}
                  onChange={(e) => update({ methodology: e.target.value })}
                />
              </Field>
              <Field label="Solution type">
                <RefSelect
                  value={it.solution_type}
                  options={refs.solutionTypes}
                  allowEmpty
                  onChange={(v) => update({ solution_type: v ?? "" })}
                />
              </Field>
              <Field label="Problems solved (pain points)">
                <RefMultiSelect
                  values={it.problems_solved}
                  options={refs.pains}
                  onChange={(v) => update({ problems_solved: v })}
                />
              </Field>
              <Field label="Waste eliminated">
                <RefMultiSelect
                  values={it.waste_eliminated}
                  options={refs.wastes}
                  onChange={(v) => update({ waste_eliminated: v })}
                />
              </Field>
              <Grid cols={2}>
                <Field label="Domains">
                  <RefMultiSelect
                    values={it.domains}
                    options={refs.domains}
                    onChange={(v) => update({ domains: v })}
                  />
                </Field>
                <Field label="Layers">
                  <RefMultiSelect
                    values={it.layers}
                    options={refs.layers}
                    onChange={(v) => update({ layers: v })}
                  />
                </Field>
              </Grid>
              <QuoteEditor
                value={it.quote}
                sessionOptions={refs.sessions}
                onChange={(q) => update({ quote: q })}
              />
            </div>
          )}
        />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">
          Priority matrix
        </p>
        <Grid cols={2}>
          <Field label="X axis label">
            <Input
              value={value.priority_matrix.x_axis_label}
              onChange={(e) =>
                set("priority_matrix", {
                  ...value.priority_matrix,
                  x_axis_label: e.target.value,
                })
              }
            />
          </Field>
          <Field label="Y axis label">
            <Input
              value={value.priority_matrix.y_axis_label}
              onChange={(e) =>
                set("priority_matrix", {
                  ...value.priority_matrix,
                  y_axis_label: e.target.value,
                })
              }
            />
          </Field>
        </Grid>
        <div className="mt-3">
          <RepeatableList
            items={value.priority_matrix.quadrants}
            onChange={(v) =>
              set("priority_matrix", { ...value.priority_matrix, quadrants: v })
            }
            make={(): Blueprint["priority_matrix"]["quadrants"][number] => ({
              id: "",
              label: "",
              position: "tl",
            })}
            addLabel="Add quadrant"
            itemLabel={(it) => `${it.position} ${it.label}`}
            renderRow={(it, _i, update) => (
              <Grid cols={3}>
                <Field label="Id">
                  <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
                </Field>
                <Field label="Label">
                  <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
                </Field>
                <Field label="Position">
                  <Select
                    value={it.position}
                    onChange={(e) =>
                      update({
                        position: e.target.value as "tl" | "tr" | "bl" | "br",
                      })
                    }
                  >
                    <option value="tl">tl</option>
                    <option value="tr">tr</option>
                    <option value="bl">bl</option>
                    <option value="br">br</option>
                  </Select>
                </Field>
              </Grid>
            )}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">
          Video gallery
        </p>
        <RepeatableList
          items={value.video_gallery}
          onChange={(v) => set("video_gallery", v)}
          make={() => ({ title: "", url: "", session_ref: "" })}
          addLabel="Add video"
          itemLabel={(it) => it.title || "Video"}
          renderRow={(it, _i, update) => (
            <Grid cols={3}>
              <Field label="Title">
                <Input value={it.title} onChange={(e) => update({ title: e.target.value })} />
              </Field>
              <Field label="URL">
                <Input value={it.url} onChange={(e) => update({ url: e.target.value })} />
              </Field>
              <Field label="Session ref">
                <RefSelect
                  value={it.session_ref}
                  options={refs.sessions}
                  allowEmpty
                  onChange={(v) => update({ session_ref: v ?? "" })}
                />
              </Field>
            </Grid>
          )}
        />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">Roadmap</p>
        <Field label="Roadmap intro">
          <Textarea
            value={value.roadmap.intro}
            onChange={(e) =>
              set("roadmap", { ...value.roadmap, intro: e.target.value })
            }
          />
        </Field>
        <div className="mt-3">
          <NumberField
            label="Total months"
            value={value.roadmap.total_months}
            onChange={(n) =>
              set("roadmap", { ...value.roadmap, total_months: n })
            }
          />
        </div>
        <div className="mt-3">
          <RepeatableList
            items={value.roadmap.initiatives}
            onChange={(v) =>
              set("roadmap", { ...value.roadmap, initiatives: v })
            }
            make={() => ({
              ref_id: "",
              label: "",
              start_month: 0,
              duration_weeks: 1,
              solution_type: "",
              tooltip: "",
            })}
            addLabel="Add initiative"
            itemLabel={(it) => it.ref_id || it.label || "Initiative"}
            renderRow={(it, _i, update) => (
              <div className="space-y-3">
                <Grid cols={2}>
                  <Field label="Blueprint opportunity">
                    <RefSelect
                      value={it.ref_id}
                      options={refs.blueprintOpps}
                      allowEmpty
                      onChange={(v) => update({ ref_id: v ?? "" })}
                    />
                  </Field>
                  <Field label="Label">
                    <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
                  </Field>
                </Grid>
                <Grid cols={3}>
                  <NumberField label="Start month" value={it.start_month} onChange={(n) => update({ start_month: n })} />
                  <NumberField label="Duration weeks" value={it.duration_weeks} onChange={(n) => update({ duration_weeks: n })} />
                  <Field label="Solution type">
                    <RefSelect
                      value={it.solution_type}
                      options={refs.solutionTypes}
                      allowEmpty
                      onChange={(v) => update({ solution_type: v ?? "" })}
                    />
                  </Field>
                </Grid>
                <Field label="Tooltip">
                  <Input value={it.tooltip} onChange={(e) => update({ tooltip: e.target.value })} />
                </Field>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
