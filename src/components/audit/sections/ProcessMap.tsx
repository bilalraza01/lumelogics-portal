"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type { ProcessMap, ProcessStep, StepType } from "@/lib/api/audits";
import {
  Grid,
  RefMultiSelect,
  RefSelect,
  RepeatableList,
  type AuditRefs,
} from "../_kit";
import { nextRefId } from "../defaults";
import { QuoteEditor } from "../fields";

const STEP_TYPES: StepType[] = [
  "standard",
  "decision",
  "automation",
  "pain_point",
];

export function ProcessMapSection({
  value,
  onChange,
  refs,
}: {
  value: ProcessMap;
  onChange: (v: ProcessMap) => void;
  refs: AuditRefs;
}) {
  const set = <K extends keyof ProcessMap>(k: K, v: ProcessMap[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-5">
      <Field label="Intro">
        <Textarea value={value.intro} onChange={(e) => set("intro", e.target.value)} />
      </Field>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">Legend</p>
        <RepeatableList
          items={value.legend}
          onChange={(v) => set("legend", v)}
          make={(): ProcessMap["legend"][number] => ({
            type: "standard",
            label: "",
            description: "",
          })}
          addLabel="Add legend entry"
          itemLabel={(it) => it.type}
          renderRow={(it, _i, update) => (
            <Grid cols={3}>
              <Field label="Type">
                <Select
                  value={it.type}
                  onChange={(e) =>
                    update({ type: e.target.value as StepType })
                  }
                >
                  {STEP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Label">
                <Input value={it.label} onChange={(e) => update({ label: e.target.value })} />
              </Field>
              <Field label="Description">
                <Input
                  value={it.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </Field>
            </Grid>
          )}
        />
      </div>

      <Grid cols={2}>
        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">Team</p>
          <RepeatableList
            items={value.team}
            onChange={(v) => set("team", v)}
            make={(ex) => ({
              id: nextRefId("PERSON", ex.map((p) => p.id), 1),
              name: "",
              role: "",
            })}
            addLabel="Add person"
            itemLabel={(it) => `${it.id} ${it.name}`}
            renderRow={(it, _i, update) => (
              <div className="space-y-2">
                <Field label="Id">
                  <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
                </Field>
                <Field label="Name">
                  <Input value={it.name} onChange={(e) => update({ name: e.target.value })} />
                </Field>
                <Field label="Role">
                  <Input value={it.role} onChange={(e) => update({ role: e.target.value })} />
                </Field>
              </div>
            )}
          />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">Tools</p>
          <RepeatableList
            items={value.tools}
            onChange={(v) => set("tools", v)}
            make={(ex) => ({
              id: nextRefId("TOOL", ex.map((t) => t.id), 1),
              name: "",
              category: "",
            })}
            addLabel="Add tool"
            itemLabel={(it) => `${it.id} ${it.name}`}
            renderRow={(it, _i, update) => (
              <div className="space-y-2">
                <Field label="Id">
                  <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
                </Field>
                <Field label="Name">
                  <Input value={it.name} onChange={(e) => update({ name: e.target.value })} />
                </Field>
                <Field label="Category">
                  <Input
                    value={it.category}
                    onChange={(e) => update({ category: e.target.value })}
                  />
                </Field>
              </div>
            )}
          />
        </div>
      </Grid>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">
          Stages and steps
        </p>
        <RepeatableList
          items={value.stages}
          onChange={(v) => set("stages", v)}
          make={(ex) => ({
            id: nextRefId("PSTAGE", ex.map((s) => s.id), 1),
            title: "",
            summary: "",
            steps: [],
          })}
          addLabel="Add stage"
          itemLabel={(it) => `${it.id} ${it.title}`}
          renderRow={(stage, si, updateStage) => (
            <div className="space-y-3">
              <Grid cols={3}>
                <Field label="Stage id">
                  <Input
                    value={stage.id}
                    onChange={(e) => updateStage({ id: e.target.value })}
                  />
                </Field>
                <Field label="Title">
                  <Input
                    value={stage.title}
                    onChange={(e) => updateStage({ title: e.target.value })}
                  />
                </Field>
                <Field label="Summary">
                  <Input
                    value={stage.summary}
                    onChange={(e) => updateStage({ summary: e.target.value })}
                  />
                </Field>
              </Grid>
              <div className="rounded-md border border-border bg-surface p-3">
                <p className="mb-2 text-[12px] font-semibold text-foreground">
                  Steps
                </p>
                <RepeatableList<ProcessStep>
                  items={stage.steps}
                  onChange={(steps) => updateStage({ steps })}
                  make={(ex): ProcessStep => ({
                    id: nextRefId(
                      `STEP-${si + 1}`,
                      ex.map((s) => s.id),
                      1,
                    ),
                    title: "",
                    description: "",
                    type: "standard",
                    confidence: "high",
                    owners: [],
                    tools: [],
                    time_estimate: { qty: 0, unit: "hours", frequency: "weekly" },
                    pain_point_ref: null,
                    quote: null,
                  })}
                  addLabel="Add step"
                  itemLabel={(it) => `${it.id} ${it.title}`}
                  renderRow={(step, _i, update) => (
                    <div className="space-y-3">
                      <Grid cols={3}>
                        <Field label="Step id">
                          <Input
                            value={step.id}
                            onChange={(e) => update({ id: e.target.value })}
                          />
                        </Field>
                        <Field label="Type">
                          <Select
                            value={step.type}
                            onChange={(e) =>
                              update({ type: e.target.value as StepType })
                            }
                          >
                            {STEP_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Confidence">
                          <Select
                            value={step.confidence}
                            onChange={(e) =>
                              update({
                                confidence:
                                  e.target.value as ProcessStep["confidence"],
                              })
                            }
                          >
                            <option value="high">high</option>
                            <option value="medium">medium</option>
                            <option value="low">low</option>
                          </Select>
                        </Field>
                      </Grid>
                      <Field label="Title">
                        <Input
                          value={step.title}
                          onChange={(e) => update({ title: e.target.value })}
                        />
                      </Field>
                      <Field label="Description">
                        <Textarea
                          value={step.description}
                          onChange={(e) =>
                            update({ description: e.target.value })
                          }
                        />
                      </Field>
                      <Grid cols={3}>
                        <Field label="Time qty">
                          <Input
                            type="number"
                            step="0.1"
                            value={step.time_estimate.qty}
                            onChange={(e) =>
                              update({
                                time_estimate: {
                                  ...step.time_estimate,
                                  qty:
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value),
                                },
                              })
                            }
                          />
                        </Field>
                        <Field label="Unit">
                          <Select
                            value={step.time_estimate.unit}
                            onChange={(e) =>
                              update({
                                time_estimate: {
                                  ...step.time_estimate,
                                  unit: e.target
                                    .value as ProcessStep["time_estimate"]["unit"],
                                },
                              })
                            }
                          >
                            <option value="minutes">minutes</option>
                            <option value="hours">hours</option>
                            <option value="days">days</option>
                          </Select>
                        </Field>
                        <Field label="Frequency">
                          <Input
                            value={step.time_estimate.frequency}
                            onChange={(e) =>
                              update({
                                time_estimate: {
                                  ...step.time_estimate,
                                  frequency: e.target.value,
                                },
                              })
                            }
                          />
                        </Field>
                      </Grid>
                      <Field label="Owners">
                        <RefMultiSelect
                          values={step.owners}
                          options={refs.team}
                          onChange={(v) => update({ owners: v })}
                        />
                      </Field>
                      <Field label="Tools">
                        <RefMultiSelect
                          values={step.tools}
                          options={refs.tools}
                          onChange={(v) => update({ tools: v })}
                        />
                      </Field>
                      <Field label="Pain point link">
                        <RefSelect
                          value={step.pain_point_ref}
                          options={refs.pains}
                          allowEmpty
                          onChange={(v) => update({ pain_point_ref: v })}
                        />
                      </Field>
                      <QuoteEditor
                        value={step.quote}
                        sessionOptions={refs.sessions}
                        onChange={(q) => update({ quote: q })}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
