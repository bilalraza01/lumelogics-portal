"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type { Session } from "@/lib/api/audits";
import { Grid, RepeatableList } from "../_kit";
import { nextRefId } from "../defaults";

export function SessionsSection({
  value,
  onChange,
}: {
  value: Session[];
  onChange: (v: Session[]) => void;
}) {
  return (
    <RepeatableList
      items={value}
      onChange={onChange}
      make={(ex) => {
        const id = nextRefId("SES", ex.map((s) => s.id), 2);
        return {
          id,
          badge: `Session ${ex.length + 1}`,
          complete: true,
          date: "",
          title: "",
          summary: "",
          stage_tags: [],
        };
      }}
      addLabel="Add session"
      itemLabel={(it) => `${it.id} ${it.badge}`}
      renderRow={(it, _i, update) => (
        <div className="space-y-3">
          <Grid cols={3}>
            <Field label="Id">
              <Input value={it.id} onChange={(e) => update({ id: e.target.value })} />
            </Field>
            <Field label="Badge">
              <Input value={it.badge} onChange={(e) => update({ badge: e.target.value })} />
            </Field>
            <Field label="Date" hint="YYYY-MM-DD">
              <Input
                type="date"
                value={it.date}
                onChange={(e) => update({ date: e.target.value })}
              />
            </Field>
          </Grid>
          <Grid cols={2}>
            <Field label="Title">
              <Input value={it.title} onChange={(e) => update({ title: e.target.value })} />
            </Field>
            <Field label="Complete">
              <Select
                value={it.complete ? "yes" : "no"}
                onChange={(e) => update({ complete: e.target.value === "yes" })}
              >
                <option value="yes">yes</option>
                <option value="no">no</option>
              </Select>
            </Field>
          </Grid>
          <Field label="Summary">
            <Textarea
              value={it.summary}
              onChange={(e) => update({ summary: e.target.value })}
            />
          </Field>
          <Field label="Stage tags" hint="Comma separated.">
            <Input
              value={it.stage_tags.join(", ")}
              onChange={(e) =>
                update({
                  stage_tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
        </div>
      )}
    />
  );
}
