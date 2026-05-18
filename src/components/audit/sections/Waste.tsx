"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type { Waste, WasteOpportunity } from "@/lib/api/audits";
import { Grid, RefSelect, RepeatableList, type AuditRefs } from "../_kit";
import { nextRefId } from "../defaults";
import { NumberField, QuoteEditor } from "../fields";

function computed(o: WasteOpportunity): number {
  return Math.round(
    o.weekly_hours * Math.max(1, o.people_affected) * o.hourly_rate * 52,
  );
}

export function WasteSection({
  value,
  onChange,
  refs,
}: {
  value: Waste;
  onChange: (v: Waste) => void;
  refs: AuditRefs;
}) {
  const totalCost = value.opportunities.reduce((s, o) => s + o.annual_cost, 0);
  const totalHrs = value.opportunities.reduce((s, o) => s + o.weekly_hours, 0);

  return (
    <div className="space-y-5">
      <Field label="Intro">
        <Textarea
          value={value.intro}
          onChange={(e) => onChange({ ...value, intro: e.target.value })}
        />
      </Field>

      <Grid cols={3}>
        <NumberField
          label="KPI: total opportunities"
          value={value.kpi_summary.total_opportunities}
          onChange={(n) =>
            onChange({
              ...value,
              kpi_summary: { ...value.kpi_summary, total_opportunities: n },
            })
          }
        />
        <NumberField
          label="KPI: recoverable hrs/week"
          step="0.1"
          value={value.kpi_summary.recoverable_hours_per_week}
          onChange={(n) =>
            onChange({
              ...value,
              kpi_summary: {
                ...value.kpi_summary,
                recoverable_hours_per_week: n,
              },
            })
          }
        />
        <Field label="Default rate label">
          <Input
            value={value.kpi_summary.default_rate_label}
            onChange={(e) =>
              onChange({
                ...value,
                kpi_summary: {
                  ...value.kpi_summary,
                  default_rate_label: e.target.value,
                },
              })
            }
          />
        </Field>
      </Grid>

      <Field label="Cost formula">
        <Input
          value={value.cost_formula}
          onChange={(e) => onChange({ ...value, cost_formula: e.target.value })}
        />
      </Field>

      <p className="rounded-md bg-black/[0.04] px-3 py-2 text-[13px] text-foreground">
        Live totals: <strong>${totalCost.toLocaleString()}</strong> a year ·{" "}
        <strong>{totalHrs}</strong> hrs/week across{" "}
        {value.opportunities.length} opportunities
      </p>

      <RepeatableList
        items={value.opportunities}
        onChange={(v) => onChange({ ...value, opportunities: v })}
        make={(ex): WasteOpportunity => ({
          ref_id: nextRefId("W", ex.map((x) => x.ref_id), 3),
          title: "",
          category: "",
          description: "",
          annual_cost: 0,
          weekly_hours: 0,
          hourly_rate: 0,
          people_affected: 1,
          priority: "medium",
          pain_point_ref: null,
          quote: null,
        })}
        addLabel="Add opportunity"
        itemLabel={(it) => `${it.ref_id} ${it.title}`}
        renderRow={(it, _i, update) => {
          const auto = computed(it);
          return (
            <div className="space-y-3">
              <Grid cols={3}>
                <Field label="Ref id">
                  <Input
                    value={it.ref_id}
                    onChange={(e) => update({ ref_id: e.target.value })}
                  />
                </Field>
                <Field label="Title">
                  <Input
                    value={it.title}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                </Field>
                <Field label="Priority">
                  <Select
                    value={it.priority}
                    onChange={(e) =>
                      update({
                        priority: e.target.value as WasteOpportunity["priority"],
                      })
                    }
                  >
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </Select>
                </Field>
              </Grid>
              <Field label="Category">
                <RefSelect
                  value={it.category}
                  options={refs.categories}
                  allowEmpty
                  onChange={(v) => update({ category: v ?? "" })}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={it.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </Field>
              <Grid cols={3}>
                <NumberField
                  label="Weekly hours"
                  step="0.1"
                  value={it.weekly_hours}
                  onChange={(n) => update({ weekly_hours: n })}
                />
                <NumberField
                  label="People affected"
                  value={it.people_affected}
                  onChange={(n) => update({ people_affected: n })}
                />
                <NumberField
                  label="Hourly rate ($)"
                  value={it.hourly_rate}
                  onChange={(n) => update({ hourly_rate: n })}
                />
              </Grid>
              <div className="flex items-end gap-3">
                <NumberField
                  label="Annual cost ($)"
                  hint={`Computed: $${auto.toLocaleString()} (hrs x people x rate x 52)`}
                  value={it.annual_cost}
                  onChange={(n) => update({ annual_cost: n })}
                />
                <button
                  type="button"
                  onClick={() => update({ annual_cost: auto })}
                  className="mb-[2px] rounded-md border border-border px-3 py-2 text-[12px] text-foreground hover:bg-black/5"
                >
                  Use computed
                </button>
              </div>
              <Field label="Pain point link">
                <RefSelect
                  value={it.pain_point_ref}
                  options={refs.pains}
                  allowEmpty
                  onChange={(v) => update({ pain_point_ref: v })}
                />
              </Field>
              <QuoteEditor
                value={it.quote}
                sessionOptions={refs.sessions}
                onChange={(q) => update({ quote: q })}
              />
            </div>
          );
        }}
      />
    </div>
  );
}
