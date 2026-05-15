"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Loader2,
  Rocket,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { dashboardApi, type DashboardData } from "@/lib/api/dashboard";
import { useAuth } from "@/lib/auth";

const ARCHETYPE_LABELS: Record<string, string> = {
  wishful_thinker:        "Wishful Thinker",
  aspirational_operator:  "Aspirational Operator",
  coordinated_operator:   "Coordinated Operator",
  build_ready_operator:   "Build-Ready Operator",
  optimization_operator:  "Optimization Operator",
};

const ARCHETYPE_ORDER = [
  "wishful_thinker",
  "aspirational_operator",
  "coordinated_operator",
  "build_ready_operator",
  "optimization_operator",
];

const PROSPECT_STATUS_LABELS: Record<string, string> = {
  not_contacted: "Not contacted",
  sent:          "Sent",
  viewed:        "Viewed",
  replied:       "Replied",
  call_booked:   "Call booked",
  won:           "Won",
  lost:          "Lost",
};

const PROSPECT_STATUS_ORDER = [
  "not_contacted",
  "sent",
  "viewed",
  "replied",
  "call_booked",
  "won",
  "lost",
];

const PROSPECT_STATUS_BAR: Record<string, string> = {
  not_contacted: "bg-black/15",
  sent:          "bg-blue-400",
  viewed:        "bg-indigo-400",
  replied:       "bg-amber-400",
  call_booked:   "bg-purple-400",
  won:           "bg-emerald-500",
  lost:          "bg-red-400",
};

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 14) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function humanizeEvent(eventType: string): string {
  return eventType.replace(/_/g, " ");
}

export default function DashboardPage() {
  const { apiFetch } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await dashboardApi.get(apiFetch));
    } catch {
      setError("Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-8 py-20 text-muted">
        <Loader2 size={18} className="mr-2 animate-spin" />
        <span className="text-sm">Loading dashboard…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-8 py-20 text-center">
        <p className="text-sm text-red-700">{error ?? "No data."}</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  const { lead_funnel, outreach_pipeline, smartlead_activity } = data;
  const pushBreakdown =
    smartlead_activity.pushes_this_week === 0
      ? "No pushes in the last 7 days"
      : Object.entries(smartlead_activity.pushes_by_status)
          .map(([k, v]) => `${v} ${k}`)
          .join(" · ");

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              The last 7 days of activity across Lumelogics.
            </p>
          </div>
        </header>

        {/* Top stat grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Assessments"
            value={lead_funnel.assessments_total}
            delta={`+${lead_funnel.assessments_this_week} this week`}
            icon={ClipboardCheck}
            tone="brand"
          />
          <StatCard
            label="Leads"
            value={lead_funnel.leads_total}
            delta={`+${lead_funnel.leads_this_week} this week · ${lead_funnel.magnet_requests_verified}/${lead_funnel.magnet_requests_total} verified`}
            icon={Users}
            href="/leads"
            tone="brand"
          />
          <StatCard
            label="Prospects"
            value={outreach_pipeline.prospects_total}
            delta={`${outreach_pipeline.videos_ready} with ready video`}
            icon={Target}
            href="/prospects"
            tone="brand"
          />
          <StatCard
            label="Pushes (7d)"
            value={smartlead_activity.pushes_this_week}
            delta={pushBreakdown}
            icon={Rocket}
            href="/campaigns"
            tone={smartlead_activity.pushes_this_week > 0 ? "emerald" : "default"}
          />
        </div>

        {/* Breakdown row */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <BreakdownCard
            title="Assessment archetypes"
            empty="No assessments submitted yet."
            rows={ARCHETYPE_ORDER.map((key) => ({
              key,
              label: ARCHETYPE_LABELS[key] ?? key,
              value: lead_funnel.assessments_by_archetype[key] ?? 0,
              bar: "bg-brand-400",
            }))}
            total={lead_funnel.assessments_total}
          />
          <BreakdownCard
            title="Prospects by status"
            empty="No prospects yet."
            rows={PROSPECT_STATUS_ORDER.map((key) => ({
              key,
              label: PROSPECT_STATUS_LABELS[key] ?? key,
              value: outreach_pipeline.prospects_by_status[key] ?? 0,
              bar: PROSPECT_STATUS_BAR[key] ?? "bg-foreground/30",
            }))}
            total={outreach_pipeline.prospects_total}
          />
        </div>

        {/* Recent activity columns */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <RecentList
            title="Recent assessments"
            href="/assessments"
            empty="No assessments yet."
            icon={ClipboardCheck}
            items={data.recent_assessments.map((a) => ({
              key: a.id,
              href: `/assessments/${a.id}`,
              primary: a.email,
              secondary: `${ARCHETYPE_LABELS[a.archetype] ?? a.archetype} · ${a.total_score}/100`,
              time: relTime(a.created_at),
            }))}
          />
          <RecentList
            title="Recent lead-magnet requests"
            href="/leads"
            empty="No magnet captures yet."
            icon={FileText}
            items={data.recent_magnet_requests.map((r) => ({
              key: r.id,
              href: `/leads/${encodeURIComponent(r.email)}`,
              primary: r.email,
              secondary: r.magnet.title + (r.verified_at ? " · verified" : " · unverified"),
              time: relTime(r.created_at),
            }))}
          />
          <RecentList
            title="Recent outreach activity"
            href="/prospects"
            empty="No outreach events yet."
            icon={Target}
            items={data.recent_activity.map((ev) => ({
              key: String(ev.id),
              href: `/prospects/${ev.prospect.id}`,
              primary: ev.prospect.email,
              secondary: humanizeEvent(ev.event_type),
              time: relTime(ev.occurred_at),
            }))}
          />
        </div>

        {/* Video pipeline strip */}
        <div className="mt-6 rounded-xl border border-border bg-surface px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-foreground">
              Video pipeline:{" "}
              <span className="font-medium">{outreach_pipeline.videos_in_flight}</span> in flight ·{" "}
              <span className="font-medium">{outreach_pipeline.videos_failed}</span> failed ·{" "}
              <span className="font-medium text-emerald-700">{outreach_pipeline.videos_ready}</span> ready
            </p>
            <Link
              href="/prospects"
              className="inline-flex items-center gap-1 text-[13px] text-brand-700 hover:text-brand-900 hover:underline"
            >
              See prospects
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BreakdownRow {
  key: string;
  label: string;
  value: number;
  bar: string;
}

function BreakdownCard({
  title,
  rows,
  total,
  empty,
}: {
  title: string;
  rows: BreakdownRow[];
  total: number;
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
          {title}
        </h2>
        <span className="text-[12px] text-muted">{total} total</span>
      </div>

      {total === 0 ? (
        <p className="mt-6 text-center text-[13px] text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => {
            const pct = Math.round((r.value / max) * 100);
            return (
              <li key={r.key}>
                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-foreground">{r.label}</span>
                  <span className="text-muted tabular-nums">{r.value}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
                  <div
                    className={`h-full rounded-full ${r.bar} transition-[width] duration-500`}
                    style={{ width: `${r.value === 0 ? 0 : Math.max(2, pct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

interface RecentItem {
  key: string;
  href?: string;
  primary: string;
  secondary: string;
  time: string;
}

function RecentList({
  title,
  href,
  icon: Icon,
  items,
  empty,
}: {
  title: string;
  href: string;
  icon: typeof ClipboardCheck;
  items: RecentItem[];
  empty: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-foreground">
          <Icon size={15} className="text-muted" />
          {title}
        </h2>
        <Link
          href={href}
          className="text-[12px] text-brand-700 hover:text-brand-900 hover:underline"
        >
          See all
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-[13px] text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((it) => {
            const inner = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {it.primary}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">{it.time}</span>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-muted">{it.secondary}</p>
              </>
            );
            return (
              <li key={it.key} className="py-2.5 first:pt-0 last:pb-0">
                {it.href ? (
                  <Link href={it.href} className="block hover:bg-brand-50/40 rounded-md px-2 -mx-2 py-1">
                    {inner}
                  </Link>
                ) : (
                  <div className="px-2 -mx-2 py-1">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
