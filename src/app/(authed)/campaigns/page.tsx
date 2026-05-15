"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { campaignsApi, type SmartleadCampaign } from "@/lib/api/campaigns";
import { useAuth } from "@/lib/auth";

export default function CampaignsIndexPage() {
  const { apiFetch } = useAuth();
  const [campaigns, setCampaigns] = useState<SmartleadCampaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [syncing, setSyncing]     = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCampaigns(await campaignsApi.list(apiFetch));
    } catch {
      setError("Could not load campaigns.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  async function onSync() {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const synced = await campaignsApi.sync(apiFetch);
      setCampaigns(synced);
      setSyncFeedback({
        kind: "success",
        message: `Synced ${synced.length} campaign(s) from Smartlead.`,
      });
    } catch (err) {
      const e = err as Error & { error?: string };
      setSyncFeedback({
        kind: "error",
        message: humanizeSmartleadError(e.error) ?? "Sync failed. Try again in a moment.",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Campaigns</h1>
            <p className="mt-1 text-[14px] text-muted">
              Smartlead campaigns synced into Lumelogics. Push ready prospects from the Prospects tab.
            </p>
          </div>
          <Button onClick={onSync} disabled={syncing} variant="outline">
            {syncing ? <><Loader2 size={14} className="animate-spin" />Syncing…</> : <><RefreshCw size={14} />Sync from Smartlead</>}
          </Button>
        </header>

        {syncFeedback && (
          <div
            role={syncFeedback.kind === "error" ? "alert" : "status"}
            className={
              syncFeedback.kind === "error"
                ? "mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800"
                : "mt-4 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-800"
            }
          >
            {syncFeedback.kind === "error" ? (
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            )}
            <span className="min-w-0 break-words">{syncFeedback.message}</span>
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
              <Button size="sm" variant="outline" className="mt-3" onClick={load}>Retry</Button>
            </div>
          )}

          {!loading && !error && campaigns.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] text-foreground">No campaigns synced yet.</p>
              <p className="mt-1 text-[13px] text-muted">Click <strong>Sync from Smartlead</strong> to pull them in.</p>
            </div>
          )}

          {!loading && !error && campaigns.length > 0 && (
            <table className="w-full table-auto text-left text-[14px]">
              <thead className="bg-black/[0.025] text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Smartlead ID</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last synced</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <Link href={`/campaigns/${c.smartlead_id}`} className="font-medium text-foreground hover:text-brand-700">
                        {c.name || "(no name)"}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-muted">{c.smartlead_id}</td>
                    <td className="px-5 py-3 text-muted">{c.status ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">
                      {c.last_synced_at ? new Date(c.last_synced_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// Smartlead returns errors like `Smartlead 401: {"message"=>"API key is required."}`.
// Pull out the human-readable bit, and surface a few common ones as actionable copy.
function humanizeSmartleadError(raw: string | undefined): string | null {
  if (!raw) return null;

  const apiKeyMissing = /api key is required/i.test(raw) || /Smartlead 401/i.test(raw);
  if (apiKeyMissing) {
    return "Smartlead rejected the request: API key missing or invalid. Set SMARTLEAD_API_KEY in the server's .env and restart the backend.";
  }

  // Try to extract { "message" => "..." } from the Ruby-style hash inspection.
  const m = raw.match(/"message"\s*=>\s*"([^"]+)"/);
  if (m) return `Smartlead: ${m[1]}`;

  return raw;
}
