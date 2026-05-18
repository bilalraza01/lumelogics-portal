"use client";

import { Field, Input, Textarea } from "@/components/ui/Input";
import type { ReportDoc } from "@/lib/api/audits";
import { Grid, RepeatableList } from "../_kit";

export function ReportSection({
  value,
  onChange,
}: {
  value: ReportDoc;
  onChange: (v: ReportDoc) => void;
}) {
  const set = <K extends keyof ReportDoc>(k: K, v: ReportDoc[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <Grid cols={2}>
        <Field label="Title">
          <Input value={value.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <Input value={value.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <Field label="Prepared for">
          <Input
            value={value.prepared_for}
            onChange={(e) => set("prepared_for", e.target.value)}
          />
        </Field>
        <Field label="Prepared on" hint="YYYY-MM-DD">
          <Input
            value={value.prepared_on}
            onChange={(e) => set("prepared_on", e.target.value)}
          />
        </Field>
      </Grid>
      <Field label="Executive summary">
        <Textarea
          className="min-h-[140px]"
          value={value.executive_summary}
          onChange={(e) => set("executive_summary", e.target.value)}
        />
      </Field>
      <Field label="Closing note">
        <Textarea
          value={value.closing_note}
          onChange={(e) => set("closing_note", e.target.value)}
        />
      </Field>
      <div>
        <p className="mb-2 text-[13px] font-semibold text-foreground">
          Sections (order and inclusion)
        </p>
        <RepeatableList
          items={value.sections}
          onChange={(v) => set("sections", v)}
          make={() => ({ anchor: "", title: "", include: true })}
          addLabel="Add section"
          itemLabel={(it) => it.title || it.anchor || "Section"}
          renderRow={(it, _i, update) => (
            <Grid cols={3}>
              <Field label="Anchor">
                <Input value={it.anchor} onChange={(e) => update({ anchor: e.target.value })} />
              </Field>
              <Field label="Title">
                <Input value={it.title} onChange={(e) => update({ title: e.target.value })} />
              </Field>
              <label className="flex items-center gap-2 pt-7 text-[13px] text-foreground">
                <input
                  type="checkbox"
                  checked={it.include}
                  onChange={(e) => update({ include: e.target.checked })}
                />
                Include in report
              </label>
            </Grid>
          )}
        />
      </div>
    </div>
  );
}
