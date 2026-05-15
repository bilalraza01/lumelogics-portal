"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  Upload,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { VideoStatusBadge } from "@/components/ui/VideoStatusBadge";
import { AttachVideoModal } from "@/components/layout/AttachVideoModal";
import { PushToCampaignModal } from "@/components/layout/PushToCampaignModal";
import {
  prospectsApi,
  PROSPECT_STATUSES,
  type Prospect,
  type ProspectStatus,
  type VideoSummary,
} from "@/lib/api/prospects";
import type { PushSummary } from "@/lib/api/campaigns";
import { useAuth } from "@/lib/auth";

const STATUS_LABELS: Record<ProspectStatus, string> = {
  not_contacted: "Not contacted",
  sent: "Sent",
  viewed: "Viewed",
  replied: "Replied",
  call_booked: "Call booked",
  won: "Won",
  lost: "Lost",
};

const STATUS_TONE: Record<ProspectStatus, string> = {
  not_contacted: "bg-black/[0.06] text-foreground",
  sent:          "bg-blue-50 text-blue-700",
  viewed:        "bg-indigo-50 text-indigo-700",
  replied:       "bg-amber-50 text-amber-700",
  call_booked:   "bg-purple-50 text-purple-700",
  won:           "bg-emerald-50 text-emerald-700",
  lost:          "bg-red-50 text-red-700",
};

const TERMINAL_VIDEO_STATUSES = new Set(["ready", "failed"]);
const POLL_INTERVAL_MS = 3000;

type VideoStatus = Parameters<typeof VideoStatusBadge>[0]["status"];

export default function ProspectsIndexPage() {
  const { apiFetch } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [query, setQuery]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ProspectStatus>("");
  const [hasVideo, setHasVideo]   = useState<"" | "true" | "false">("");

  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [attachTarget, setAttachTarget] = useState<{ prospect: Prospect; mode: "attach" | "reattach" } | null>(null);
  const [pushOpen, setPushOpen]   = useState(false);
  const [pushResult, setPushResult] = useState<{ summary: PushSummary; campaignName: string | null } | null>(null);

  const filtersRef = useRef({ query, statusFilter, hasVideo });
  filtersRef.current = { query, statusFilter, hasVideo };

  const load = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!opts.silent) setLoading(true);
      try {
        const { query, statusFilter, hasVideo } = filtersRef.current;
        const list = await prospectsApi.list(apiFetch, {
          q: query || undefined,
          status: (statusFilter || undefined) as ProspectStatus | undefined,
          has_video: hasVideo === "" ? undefined : hasVideo === "true",
        });
        setProspects(list);
        setError(null);
      } catch {
        if (!opts.silent) setError("Could not load prospects.");
      } finally {
        if (!opts.silent) setLoading(false);
      }
    },
    [apiFetch],
  );

  // Debounced reload when filters change.
  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [query, statusFilter, hasVideo, load]);

  // Poll silently while any prospect has a non-terminal video.
  const anyInFlight = prospects.some(
    (p) => p.latest_video && !TERMINAL_VIDEO_STATUSES.has(p.latest_video.status),
  );
  useEffect(() => {
    if (!anyInFlight) return;
    const interval = setInterval(() => load({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [anyInFlight, load]);

  // Selection helpers
  const visibleIds = useMemo(() => prospects.map((p) => p.id), [prospects]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selected.has(id)).length,
    [visibleIds, selected],
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  function toggleOne(id: number) {
    setSelected((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((curr) => {
      const next = new Set(curr);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function openAttach(prospect: Prospect, mode: "attach" | "reattach") {
    setAttachTarget({ prospect, mode });
  }

  function onAttached() {
    setAttachTarget(null);
    load({ silent: true });
  }

  const labelMap = useMemo(() => {
    const m: Record<number, string> = {};
    for (const p of prospects) m[p.id] = p.email;
    return m;
  }, [prospects]);

  function onPushed(summary: PushSummary) {
    setPushOpen(false);
    setPushResult({ summary, campaignName: summary.smartlead_campaign_name });
    clearSelection();
    load({ silent: true });
  }

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Prospects</h1>
            <p className="mt-1 text-[14px] text-muted">
              Outreach contacts. Imported via CSV or created manually, then attached to a Loom and pushed to Smartlead.
            </p>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/prospects/import" variant="outline">
              <Upload size={15} />
              Import CSV
            </ButtonLink>
            <ButtonLink href="/prospects/new">
              <Plus size={16} />
              New prospect
            </ButtonLink>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email, name, company…"
              className="block w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[14px] placeholder:text-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="w-44">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProspectStatus | "")}>
              <option value="">All statuses</option>
              {PROSPECT_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </div>
          <div className="w-44">
            <Select value={hasVideo} onChange={(e) => setHasVideo(e.target.value as "true" | "false" | "")}>
              <option value="">Any video state</option>
              <option value="true">Has ready video</option>
              <option value="false">No ready video</option>
            </Select>
          </div>
          {anyInFlight && (
            <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted">
              <Loader2 size={12} className="animate-spin" />
              Live-polling video status
            </span>
          )}
        </div>

        {pushResult && (
          <PushResultBanner result={pushResult} labels={labelMap} onDismiss={() => setPushResult(null)} />
        )}

        {selected.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
            <div className="flex items-center gap-3 text-[13px] text-brand-900">
              <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-brand-500 px-2 text-[12px] font-semibold text-white">
                {selected.size}
              </span>
              <span>
                prospect{selected.size === 1 ? "" : "s"} selected
              </span>
              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-1 text-[12px] text-brand-700 hover:text-brand-900 hover:underline"
              >
                <X size={12} />Clear
              </button>
            </div>
            <Button onClick={() => setPushOpen(true)} size="sm">
              <Rocket size={14} />
              Push to campaign
            </Button>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          {loading && (
            <div className="flex items-center justify-center py-16 text-muted">
              <Loader2 size={18} className="mr-2 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {!loading && error && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => load()}>Retry</Button>
            </div>
          )}

          {!loading && !error && prospects.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] text-foreground">No prospects match these filters.</p>
              <p className="mt-1 text-[13px] text-muted">Upload a CSV or create one manually to get started.</p>
            </div>
          )}

          {!loading && !error && prospects.length > 0 && (
            <table className="w-full table-auto text-left text-[14px]">
              <thead className="bg-black/[0.025] text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      ref={(el) => { if (el) el.indeterminate = someVisibleSelected; }}
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      aria-label="Select all visible"
                      className="size-4 cursor-pointer rounded border-border accent-brand-500"
                    />
                  </th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Batch</th>
                  <th className="px-5 py-3 font-medium">Video</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((p) => {
                  const isSelected = selected.has(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`border-t border-border align-middle ${isSelected ? "bg-brand-50/40" : "hover:bg-brand-50/40"}`}
                    >
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(p.id)}
                          aria-label={`Select ${p.email}`}
                          className="size-4 cursor-pointer rounded border-border accent-brand-500"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/prospects/${p.id}`} className="font-medium text-foreground hover:text-brand-700">
                          {p.email}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted">{p.company_name || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium ${STATUS_TONE[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted">{p.batch_id ?? "—"}</td>
                      <td className="px-5 py-3">
                        <VideoCell video={p.latest_video ?? null} />
                      </td>
                      <td className="px-5 py-3">
                        <ViewsCell count={p.view_count} lastViewedAt={p.last_viewed_at} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <VideoAction
                            video={p.latest_video ?? null}
                            onAttach={() => openAttach(p, "attach")}
                            onReattach={() => openAttach(p, "reattach")}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {attachTarget && (
        <AttachVideoModal
          prospectId={attachTarget.prospect.id}
          prospectEmail={attachTarget.prospect.email}
          mode={attachTarget.mode}
          initialBatchId={attachTarget.prospect.latest_video?.batch_id ?? attachTarget.prospect.batch_id ?? null}
          onClose={() => setAttachTarget(null)}
          onAttached={onAttached}
        />
      )}

      {pushOpen && (
        <PushToCampaignModal
          prospectIds={Array.from(selected)}
          prospectLabels={labelMap}
          onClose={() => setPushOpen(false)}
          onPushed={onPushed}
        />
      )}
    </div>
  );
}

function VideoCell({ video }: { video: VideoSummary | null }) {
  if (!video) return <span className="text-[13px] text-muted">—</span>;

  const status = video.status as VideoStatus;
  const isReady = status === "ready";

  return (
    <div className="flex items-center gap-3">
      {isReady && video.gif_url ? (
        <a
          href={video.player_url ?? video.gif_url}
          target="_blank"
          rel="noreferrer"
          className="block shrink-0 overflow-hidden rounded-md border border-border bg-black/5"
          title={video.player_url ?? undefined}
        >
          <img
            src={video.gif_url}
            alt="Video preview"
            className="block h-10 w-[72px] object-cover"
          />
        </a>
      ) : (
        <span className="inline-flex h-10 w-[72px] shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted">
          <VideoIcon size={14} />
        </span>
      )}
      <VideoStatusBadge status={status} errorMessage={video.error_message} />
    </div>
  );
}

function ViewsCell({
  count,
  lastViewedAt,
}: {
  count: number;
  lastViewedAt: string | null;
}) {
  if (count === 0) {
    return <span className="text-[13px] text-muted">—</span>;
  }
  const last = lastViewedAt ? relativeTime(lastViewedAt) : null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px]">
      <Eye size={13} className="text-emerald-600" />
      <span className="font-medium text-foreground">{count}</span>
      {last && <span className="text-muted">· {last}</span>}
    </span>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 14) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function VideoAction({
  video,
  onAttach,
  onReattach,
}: {
  video: VideoSummary | null;
  onAttach: () => void;
  onReattach: () => void;
}) {
  if (!video) {
    return (
      <Button size="sm" variant="outline" onClick={onAttach}>
        <VideoIcon size={13} />
        Attach
      </Button>
    );
  }
  if (video.status === "failed") {
    return (
      <Button size="sm" variant="outline" onClick={onReattach}>
        <RotateCcw size={13} />
        Re-attach
      </Button>
    );
  }
  if (video.status === "ready") {
    return (
      <Button size="sm" variant="ghost" onClick={onReattach} title="Attach a new Loom URL — keeps the existing one for history">
        <RotateCcw size={13} />
        Replace
      </Button>
    );
  }
  return <span className="text-[12px] text-muted">in progress…</span>;
}

const REASON_LABELS: Record<string, string> = {
  missing_email:                   "Email is missing",
  invalid_email_format:            "Email format is invalid",
  video_not_ready:                 "Video still processing",
  missing_video:                   "No video attached",
  already_pushed_to_this_campaign: "Already pushed to this campaign",
  not_found:                       "Prospect not found",
};

function PushResultBanner({
  result,
  labels,
  onDismiss,
}: {
  result: { summary: PushSummary; campaignName: string | null };
  labels: Record<number, string>;
  onDismiss: () => void;
}) {
  const { summary, campaignName } = result;
  const pushed  = summary.pushed.length;
  const blocked = summary.blocked.length;
  const errored = summary.errors.length;

  const tone = errored > 0 ? "red" : pushed > 0 ? "emerald" : "amber";
  const colours = {
    emerald: { box: "border-emerald-200 bg-emerald-50", text: "text-emerald-900", body: "text-emerald-800", icon: "text-emerald-600" },
    amber:   { box: "border-amber-200 bg-amber-50",   text: "text-amber-900",   body: "text-amber-800",   icon: "text-amber-600" },
    red:     { box: "border-red-200 bg-red-50",       text: "text-red-900",     body: "text-red-800",     icon: "text-red-600" },
  }[tone];
  const Icon = tone === "red" ? AlertCircle : CheckCircle2;

  return (
    <div
      role="status"
      className={`mt-4 rounded-md border px-4 py-3 ${colours.box}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex items-start gap-2 ${colours.text}`}>
          <Icon size={16} className={`mt-0.5 shrink-0 ${colours.icon}`} />
          <div>
            <p className="text-[14px] font-semibold">
              {pushed > 0
                ? `Pushed ${pushed} prospect${pushed === 1 ? "" : "s"} to ${campaignName ?? "the campaign"}.`
                : "Nothing was pushed."}
            </p>
            {(blocked > 0 || errored > 0) && (
              <p className={`mt-0.5 text-[13px] ${colours.body}`}>
                {blocked > 0 && <>Skipped {blocked} (see details). </>}
                {errored > 0 && <>{errored} chunk error{errored === 1 ? "" : "s"}.</>}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className={`rounded-md p-1 ${colours.body} hover:bg-black/5`}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      {summary.blocked.length > 0 && (
        <details className={`mt-3 ${colours.body}`}>
          <summary className="cursor-pointer text-[12px] font-medium">Show skipped prospects</summary>
          <ul className="mt-2 space-y-1 pl-2 text-[12px]">
            {summary.blocked.map((b) => (
              <li key={b.prospect_id}>
                <span className="font-medium">
                  {labels[b.prospect_id] ?? `Prospect #${b.prospect_id}`}
                </span>{" "}
                — {b.reasons.map((r) => REASON_LABELS[r] ?? r.replace(/_/g, " ")).join("; ")}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
