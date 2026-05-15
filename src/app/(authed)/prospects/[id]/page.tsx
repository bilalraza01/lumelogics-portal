"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Play,
  Trash2,
  Video as VideoIcon,
  XCircle,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { prospectsApi, type Prospect, type VideoSummary } from "@/lib/api/prospects";
import { videosApi } from "@/lib/api/videos";
import { useAuth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const TERMINAL_VIDEO_STATUSES = new Set(["ready", "failed"]);

export default function ProspectDetailPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const id = Number(rawId);
  const router = useAuth();
  const { apiFetch } = router;
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<"not_found" | "load_failed" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const p = await prospectsApi.get(apiFetch, id);
      setProspect(p);
      setError(null);
    } catch (err) {
      const e = err as Error;
      setError(e.message === "request_failed_404" ? "not_found" : "load_failed");
    }
  }, [apiFetch, id]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  // Poll the latest video every 3s while it's in a non-terminal state.
  useEffect(() => {
    const v = prospect?.latest_video;
    if (!v || TERMINAL_VIDEO_STATUSES.has(v.status)) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const fresh = await videosApi.get(apiFetch, v.id);
        setProspect((curr) => (curr ? { ...curr, latest_video: fresh, active_video: fresh.status === "ready" ? fresh : curr.active_video } : curr));
        if (TERMINAL_VIDEO_STATUSES.has(fresh.status)) {
          // Reload everything once we're terminal so the activity timeline includes the latest events.
          load();
        }
      } catch {
        // ignore — next tick will retry
      }
    }, 3000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [apiFetch, prospect?.latest_video, load]);

  async function onDelete() {
    if (!prospect) return;
    if (!window.confirm(`Delete ${prospect.email}? This also removes all attached videos and activity.`)) return;
    setDeleting(true);
    try {
      await prospectsApi.destroy(apiFetch, prospect.id);
      window.location.href = "/prospects";
    } catch {
      window.alert("Delete failed.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="px-8 py-10 text-muted">
        <Loader2 size={18} className="mr-2 inline animate-spin" />
        <span className="text-sm">Loading prospect…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="px-8 py-10">
        <Link href="/prospects" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
          <ArrowLeft size={14} />Back to prospects
        </Link>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-[15px] font-semibold text-red-900">
            {error === "not_found" ? "Prospect not found" : "Couldn't load this prospect"}
          </h2>
        </div>
      </div>
    );
  }
  if (!prospect) return null;

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/prospects" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
          <ArrowLeft size={14} />Back to prospects
        </Link>

        <header className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-all text-[28px] font-semibold tracking-tight text-foreground">
              {[prospect.first_name, prospect.last_name].filter(Boolean).join(" ") || prospect.email}
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              {prospect.email}
              {prospect.company_name && <> · {prospect.company_name}</>}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <ButtonLink href={`/prospects/${prospect.id}/videos/new`} size="sm">
              <VideoIcon size={14} />Attach video
            </ButtonLink>
            <Button onClick={onDelete} variant="danger" size="sm" disabled={deleting}>
              <Trash2 size={14} />Delete
            </Button>
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <ProfileCard prospect={prospect} />
          <VideoCard video={prospect.latest_video ?? null} />
        </section>

        <ViewsCard
          viewCount={prospect.view_count}
          lastViewedAt={prospect.last_viewed_at}
          viewEvents={(prospect.activities ?? []).filter((a) => a.event_type === "video_viewed")}
        />

        <ActivitySection activities={prospect.activities ?? []} />
      </div>
    </div>
  );
}

function ProfileCard({ prospect }: { prospect: Prospect }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Profile</h2>
      <dl className="mt-4 space-y-3 text-[13px]">
        <Row label="Status">{prospect.status.replace(/_/g, " ")}</Row>
        <Row label="Batch">{prospect.batch_id ?? "—"}</Row>
        <Row label="LinkedIn">
          {prospect.linkedin_url ? (
            <a href={prospect.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
              {prospect.linkedin_url}
            </a>
          ) : "—"}
        </Row>
        <Row label="Website">
          {prospect.website ? (
            <a href={prospect.website} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
              {prospect.website}
            </a>
          ) : "—"}
        </Row>
        <Row label="Created">{formatDateTime(prospect.created_at)}</Row>
        {prospect.notes && <Row label="Notes"><span className="whitespace-pre-line">{prospect.notes}</span></Row>}
      </dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

function VideoCard({ video }: { video: VideoSummary | null }) {
  if (!video) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-surface p-6 text-center">
        <VideoIcon size={24} className="mx-auto text-muted" />
        <p className="mt-2 text-[14px] text-foreground">No video attached yet</p>
        <p className="mt-1 text-[12px] text-muted">Paste a Loom URL to start the pipeline.</p>
      </section>
    );
  }

  const isReady     = video.status === "ready";
  const isFailed    = video.status === "failed";
  const isProcessing = !isReady && !isFailed;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Latest video</h2>
        <span
          className={
            isReady
              ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700"
              : isFailed
                ? "inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-medium text-red-700"
                : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-700"
          }
        >
          {isReady ? <CheckCircle2 size={13} /> : isFailed ? <XCircle size={13} /> : <Loader2 size={13} className="animate-spin" />}
          {video.status.replace(/_/g, " ")}
        </span>
      </div>

      {video.gif_url && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-black/5">
          <img src={video.gif_url} alt="Video preview" className="block w-full" />
        </div>
      )}

      <dl className="mt-4 space-y-2 text-[13px]">
        <Row label="Slug"><span className="font-mono text-[12px]">{video.slug}</span></Row>
        <Row label="Loom">
          <a href={video.loom_url} target="_blank" rel="noreferrer" className="break-all text-brand-700 hover:underline">
            {video.loom_url}
          </a>
        </Row>
        {video.duration_seconds && <Row label="Duration">{video.duration_seconds}s</Row>}
        {video.player_url && (
          <Row label="Player">
            <a href={video.player_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
              <Play size={13} />{video.player_url}
            </a>
          </Row>
        )}
        {isFailed && video.error_message && (
          <Row label="Error"><span className="text-red-700">{video.error_message}</span></Row>
        )}
      </dl>

      {isProcessing && (
        <p className="mt-3 text-[12px] text-muted">Polling every 3s for status updates…</p>
      )}
    </section>
  );
}

function ViewsCard({
  viewCount,
  lastViewedAt,
  viewEvents,
}: {
  viewCount: number;
  lastViewedAt: string | null;
  viewEvents: NonNullable<Prospect["activities"]>;
}) {
  if (viewCount === 0) {
    return (
      <section className="mt-8 rounded-xl border border-dashed border-border bg-surface p-6 text-center">
        <Eye size={20} className="mx-auto text-muted" />
        <p className="mt-2 text-[14px] text-foreground">No video views yet</p>
        <p className="mt-1 text-[12px] text-muted">
          Once they open the player URL we&apos;ll show every view here.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
          <Eye size={14} />
          Video views
        </h2>
        <span className="text-[12px] text-muted">
          {lastViewedAt && <>Last seen {formatDateTime(lastViewedAt)} · </>}
          {viewCount} total
        </span>
      </div>

      {viewEvents.length === 0 ? (
        <p className="mt-4 text-[13px] text-muted">
          Older view events aren&apos;t in the recent activity window (only the last 50 events
          are loaded). The count above is authoritative.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {viewEvents.map((ev) => {
            const meta = ev.metadata as {
              slug?: string;
              ip_hash?: string;
              user_agent?: string;
              referrer?: string;
            };
            return (
              <li key={ev.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] text-foreground">
                      Viewed <code className="rounded bg-black/[0.05] px-1 py-0.5 text-[11px]">/v/{meta.slug ?? "?"}</code>
                    </p>
                    {meta.user_agent && (
                      <p className="mt-1 truncate text-[12px] text-muted">{meta.user_agent}</p>
                    )}
                    {meta.referrer && (
                      <p className="truncate text-[12px] text-muted">From {meta.referrer}</p>
                    )}
                    {meta.ip_hash && (
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        IP hash {meta.ip_hash.slice(0, 12)}…
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[12px] text-muted">
                    {formatDateTime(ev.occurred_at)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ActivitySection({ activities }: { activities: NonNullable<Prospect["activities"]> }) {
  if (activities.length === 0) return null;
  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-6">
      <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Activity</h2>
      <ol className="mt-5 space-y-3 text-[13px]">
        {activities.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-brand-400" />
            <div className="min-w-0 flex-1">
              <p className="text-foreground">{a.event_type.replace(/_/g, " ")}</p>
              {Object.keys(a.metadata).length > 0 && (
                <p className="mt-0.5 break-all text-[12px] text-muted">
                  {Object.entries(a.metadata).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(" · ")}
                </p>
              )}
              <p className="mt-0.5 text-[12px] text-muted">{formatDateTime(a.occurred_at)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
