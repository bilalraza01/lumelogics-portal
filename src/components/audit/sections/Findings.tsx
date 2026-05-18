"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type { Category, FindingItem, Findings } from "@/lib/api/audits";
import { Grid, RefSelect, RepeatableList, type AuditRefs } from "../_kit";
import { nextRefId } from "../defaults";

export function CategoriesSection({
  value,
  onChange,
}: {
  value: Category[];
  onChange: (v: Category[]) => void;
}) {
  return (
    <RepeatableList
      items={value}
      onChange={onChange}
      make={(ex) => ({
        id: nextRefId("CAT", ex.map((c) => c.id), 1),
        label: "",
        description: "",
      })}
      addLabel="Add category"
      itemLabel={(it) => `${it.id} ${it.label}`}
      renderRow={(it, _i, update) => (
        <Grid cols={3}>
          <Field label="Id">
            <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
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
  );
}

function FindingRows({
  kind,
  prefix,
  items,
  onChange,
  refs,
}: {
  kind: string;
  prefix: string;
  items: FindingItem[];
  onChange: (v: FindingItem[]) => void;
  refs: AuditRefs;
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold text-foreground">{kind}</p>
      <RepeatableList
        items={items}
        onChange={onChange}
        make={(ex): FindingItem => ({
          ref_id: nextRefId(prefix, ex.map((x) => x.ref_id), 3),
          title: "",
          severity: "MEDIUM",
          category: "",
          source_session: "",
          description: "",
        })}
        addLabel={`Add ${kind.toLowerCase()}`}
        itemLabel={(it) => `${it.ref_id} ${it.title}`}
        renderRow={(it, _i, update) => (
          <div className="space-y-3">
            <Grid cols={3}>
              <Field label="Ref id">
                <Input
                  value={it.ref_id}
                  onChange={(e) => update({ ref_id: e.target.value })}
                />
              </Field>
              <Field label="Severity">
                <Select
                  value={it.severity}
                  onChange={(e) =>
                    update({ severity: e.target.value as FindingItem["severity"] })
                  }
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                </Select>
              </Field>
              <Field label="Title">
                <Input
                  value={it.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </Field>
            </Grid>
            <Grid cols={2}>
              <Field label="Category">
                <RefSelect
                  value={it.category}
                  options={refs.categories}
                  allowEmpty
                  onChange={(v) => update({ category: v ?? "" })}
                />
              </Field>
              <Field label="Source session">
                <RefSelect
                  value={it.source_session}
                  options={refs.sessions}
                  allowEmpty
                  onChange={(v) => update({ source_session: v ?? "" })}
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
    </div>
  );
}

export function FindingsSection({
  value,
  onChange,
  refs,
}: {
  value: Findings;
  onChange: (v: Findings) => void;
  refs: AuditRefs;
}) {
  return (
    <div className="space-y-5">
      <Field label="Intro">
        <Textarea
          value={value.intro}
          onChange={(e) => onChange({ ...value, intro: e.target.value })}
        />
      </Field>
      <FindingRows
        kind="Pain points"
        prefix="PP"
        items={value.pain_points}
        onChange={(v) => onChange({ ...value, pain_points: v })}
        refs={refs}
      />
      <FindingRows
        kind="Optimisations"
        prefix="OPT"
        items={value.optimisations}
        onChange={(v) => onChange({ ...value, optimisations: v })}
        refs={refs}
      />
    </div>
  );
}
