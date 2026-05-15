"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart2, CheckCircle2, Loader2, Rocket, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { campaignsApi, type PreflightResult, type PushSummary } from "@/lib/api/campaigns";
import { prospectsApi, type Prospect } from "@/lib/api/prospects";
import { useAuth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const smartleadId = Number(rawId);
  const { apiFetch } = useAuth();

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [loading, setLoading]     = useState(true);
  const [analytics, setAnalytics] = useState<unknown>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [pushing, setPushing]     = useState(false);
  const [pushResult, setPushResult] = useState<PushSummary | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const loadProspects = useCallback(async () => {
    try {
      const list = await prospectsApi.list(apiFetch, { has_video: true });
      setProspects(list);
    } catch {
      setError("Could not load prospects.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => { loadProspects(); }, [loadProspects]);

  async function onLoadAnalytics() {
    setAnalyticsLoading(true);
    try {
      setAnalytics(await campaignsApi.analytics(apiFetch, smartleadId));
    } catch (err) {
      const e = err as Error & { error?: string };
      setError(e.error ?? "Analytics fetch failed.");
    } finally {
      setAnalyticsLoading(false);
    }
  }

  function toggle(id: number) {
    setSelected((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function onPreflight() {
    setError(null);
    setPreflight(null);
    setPushResult(null);
    if (selected.size === 0) {
      setError("Pick at least one prospect first.");
      return;
    }
    try {
      setPreflight(await campaignsApi.preflight(apiFetch, smartleadId, Array.from(selected)));
    } catch (err) {
      const e = err as Error & { error?: string };
      setError(e.error ?? "Preflight failed.");
    }
  }

  async function onPush() {
    setError(null);
    setPushResult(null);
    if (selected.size === 0) return;
    setPushing(true);
    try {
      setPushResult(await campaignsApi.push(apiFetch, smartleadId, Array.from(selected)));
    } catch (err) {
      const e = err as Error & { error?: string };
      setError(e.error ?? "Push failed.");
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/campaigns" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
          <ArrowLeft size={14} />Back to campaigns
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-foreground">
          Campaign <span className="font-mono text-[20px] text-muted">#{smartleadId}</span>
        </h1>

        <section className="mt-6 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Smartlead analytics</h2>
            <Button variant="outline" size="sm" onClick={onLoadAnalytics} disabled={analyticsLoading}>
              {analyticsLoading ? <><Loader2 size={13} className="animate-spin" />Loading…</> : <><BarChart2 size={13} />Fetch</>}
            </Button>
          </div>
          {analytics ? (
            <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-black/[0.04] p-3 text-[12px] text-foreground">
              {JSON.stringify(analytics, null, 2)}
            </pre>
          ) : (
            <p className="mt-3 text-[13px] text-muted">Click <strong>Fetch</strong> to call Smartlead.</p>
          )}
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
              Prospects with a ready video ({prospects.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onPreflight} disabled={selected.size === 0}>
                Preflight
              </Button>
              <Button size="sm" onClick={onPush} disabled={selected.size === 0 || pushing}>
                {pushing ? <><Loader2 size={13} className="animate-spin" />Pushing…</> : <><Rocket size={13} />Push {selected.size}</>}
              </Button>
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted">
                <Loader2 size={16} className="mr-2 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : prospects.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-muted">
                No prospects have a ready video yet. Attach a Loom on a prospect and wait for the pipeline to finish.
              </div>
            ) : (
              <table className="w-full table-auto text-left text-[14px]">
                <thead className="bg-black/[0.025] text-[12px] uppercase tracking-wider text-muted">
                  <tr>
                    <th className="w-10 px-5 py-3"></th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggle(p.id)}
                          className="size-4 rounded border-border accent-brand-500"
                        />
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">{p.email}</td>
                      <td className="px-5 py-3 text-muted">
                        {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted">{p.company_name || "—"}</td>
                      <td className="px-5 py-3 text-muted">{p.status.replace(/_/g, " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {preflight && (
          <section className="mt-6 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Preflight</h2>
            <p className="mt-2 text-[13px]">
              <span className="text-emerald-700 font-medium">{preflight.ready.length} ready</span>
              <span className="mx-2 text-border">·</span>
              <span className="text-amber-700 font-medium">{preflight.blocked.length} blocked</span>
            </p>
            {preflight.blocked.length > 0 && (
              <ul className="mt-3 space-y-1 text-[13px] text-amber-800">
                {preflight.blocked.map((b) => (
                  <li key={b.prospect_id}>
                    Prospect #{b.prospect_id}: {b.reasons.join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {pushResult && (
          <section className="mt-6 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Push result</h2>
            <dl className="mt-4 grid grid-cols-3 gap-4 text-center">
              <Stat label="Pushed" value={pushResult.pushed.length} tone="emerald" icon={<CheckCircle2 size={14} />} />
              <Stat label="Blocked" value={pushResult.blocked.length} tone="amber" icon={<XCircle size={14} />} />
              <Stat label="Errors" value={pushResult.errors.length} tone="red" icon={<XCircle size={14} />} />
            </dl>
            {pushResult.errors.length > 0 && (
              <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-red-50 p-3 text-[12px] text-red-800">
                {JSON.stringify(pushResult.errors, null, 2)}
              </pre>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: number; tone: "emerald" | "amber" | "red"; icon: React.ReactNode }) {
  const colors: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber:   "bg-amber-50 text-amber-700",
    red:     "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-lg p-4 ${colors[tone]}`}>
      <dt className="flex items-center justify-center gap-1 text-[12px] uppercase tracking-wider">
        {icon}{label}
      </dt>
      <dd className="mt-1 text-[24px] font-semibold">{value}</dd>
    </div>
  );
}
