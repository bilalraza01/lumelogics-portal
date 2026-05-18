"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/* ------------------------------- Section -------------------------------- */

export function Section({
  title,
  subtitle,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  badge?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {open ? (
            <ChevronDown size={16} className="text-muted" />
          ) : (
            <ChevronRight size={16} className="text-muted" />
          )}
          <span className="text-[15px] font-semibold text-foreground">
            {title}
          </span>
          {badge && (
            <span className="rounded bg-black/[0.05] px-2 py-0.5 text-[11px] text-muted">
              {badge}
            </span>
          )}
        </span>
        {subtitle && !open && (
          <span className="truncate text-[12px] text-muted">{subtitle}</span>
        )}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border px-6 py-5">
          {subtitle && (
            <p className="text-[12px] text-muted">{subtitle}</p>
          )}
          {children}
        </div>
      )}
    </section>
  );
}

/* ----------------------------- Grid helper ------------------------------ */

export function Grid({
  cols = 2,
  children,
}: {
  cols?: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

/* --------------------------- RepeatableList ----------------------------- */

export function RepeatableList<T>({
  items,
  onChange,
  make,
  addLabel,
  itemLabel,
  renderRow,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  make: (existing: T[]) => T;
  addLabel: string;
  itemLabel: (item: T, index: number) => string;
  renderRow: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  function update(index: number, patch: Partial<T>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-background/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
              <GripVertical size={13} className="text-muted" />
              {itemLabel(item, i)}
            </span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded px-1.5 py-0.5 text-[12px] text-muted hover:bg-black/5 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="rounded px-1.5 py-0.5 text-[12px] text-muted hover:bg-black/5 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[12px] text-red-600 hover:bg-red-50"
              >
                <Trash2 size={12} />
                Remove
              </button>
            </span>
          </div>
          {renderRow(item, i, (patch) => update(i, patch))}
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onChange([...items, make(items)])}
      >
        <Plus size={14} />
        {addLabel}
      </Button>
    </div>
  );
}

/* --------------------------- ref pickers -------------------------------- */

export interface RefOption {
  value: string;
  label: string;
}

// The non-content audit columns (edited in the Basics section).
export interface AuditMeta {
  slug: string;
  client_name: string;
  industry: string;
  status: "in_progress" | "in_review" | "delivered" | "archived";
  started_on: string;
  completed_on: string;
}

// Cross-reference option lists, computed once by AuditForm from the live
// draft and passed to every section so pickers only offer ids that exist.
export interface AuditRefs {
  sessions: RefOption[];
  categories: RefOption[];
  pains: RefOption[];
  wastes: RefOption[];
  domains: RefOption[];
  layers: RefOption[];
  solutionTypes: RefOption[];
  team: RefOption[];
  tools: RefOption[];
  blueprintOpps: RefOption[];
}

const selBase =
  "block w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] text-foreground focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function RefSelect({
  value,
  options,
  onChange,
  allowEmpty = true,
}: {
  value: string | null | undefined;
  options: RefOption[];
  onChange: (v: string | null) => void;
  allowEmpty?: boolean;
}) {
  const dangling = value && !options.some((o) => o.value === value);
  return (
    <div>
      <select
        className={cn(selBase, dangling && "border-red-400")}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        {allowEmpty && <option value="">None</option>}
        {dangling && <option value={value!}>{value} (missing)</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {dangling && (
        <span className="mt-1 block text-[11px] text-red-600">
          References an id that no longer exists.
        </span>
      )}
    </div>
  );
}

export function RefMultiSelect({
  values,
  options,
  onChange,
}: {
  values: string[];
  options: RefOption[];
  onChange: (v: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(
      values.includes(id) ? values.filter((v) => v !== id) : [...values, id],
    );
  }
  const missing = values.filter((v) => !options.some((o) => o.value === v));
  return (
    <div className="rounded-md border border-border bg-surface p-2">
      {options.length === 0 && (
        <p className="px-1 py-1 text-[12px] text-muted">
          Nothing to link yet.
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12px]",
                on
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-border text-muted hover:bg-black/5",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {missing.length > 0 && (
        <p className="mt-1.5 px-1 text-[11px] text-red-600">
          Missing ids: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}
