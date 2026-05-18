"use client";

import { Field, Input, Textarea } from "@/components/ui/Input";
import type { Quote } from "@/lib/api/audits";
import { RefSelect, type RefOption } from "./_kit";

// Optional attributed quote. `value` is null when there is no quote; the
// toggle adds/removes it. Used by process steps, waste and blueprint items.
export function QuoteEditor({
  value,
  onChange,
  sessionOptions,
}: {
  value: Quote | null | undefined;
  onChange: (q: Quote | null) => void;
  sessionOptions: RefOption[];
}) {
  if (!value) {
    return (
      <button
        type="button"
        onClick={() =>
          onChange({
            text: "",
            speaker: "",
            session_ref: "",
            recording_timestamp: null,
            recording_url: null,
          })
        }
        className="text-[13px] font-medium text-brand-600 hover:underline"
      >
        + Add a quote
      </button>
    );
  }
  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-foreground">Quote</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[12px] text-red-600 hover:underline"
        >
          Remove quote
        </button>
      </div>
      <Field label="Quote text">
        <Textarea
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Speaker">
          <Input
            value={value.speaker}
            onChange={(e) => onChange({ ...value, speaker: e.target.value })}
          />
        </Field>
        <Field label="Source session">
          <RefSelect
            value={value.session_ref}
            options={sessionOptions}
            allowEmpty
            onChange={(v) => onChange({ ...value, session_ref: v ?? "" })}
          />
        </Field>
        <Field label="Recording timestamp" hint="e.g. 00:12:40">
          <Input
            value={value.recording_timestamp ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                recording_timestamp: e.target.value || null,
              })
            }
          />
        </Field>
        <Field label="Recording URL">
          <Input
            value={value.recording_url ?? ""}
            onChange={(e) =>
              onChange({ ...value, recording_url: e.target.value || null })
            }
          />
        </Field>
      </div>
    </div>
  );
}

// Number input that round-trips as a JS number (empty -> 0).
export function NumberField({
  label,
  hint,
  value,
  onChange,
  step,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  step?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </Field>
  );
}
