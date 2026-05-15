"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  campaignsApi,
  type PreflightResult,
  type PushSummary,
  type SmartleadCampaign,
} from "@/lib/api/campaigns";
import { useAuth } from "@/lib/auth";

const REASON_LABELS: Record<string, string> = {
  missing_email:                   "Email is missing",
  invalid_email_format:            "Email format is invalid",
  video_not_ready:                 "Video still processing",
  missing_video:                   "No video attached",
  already_pushed_to_this_campaign: "Already pushed to this campaign",
  not_found:                       "Prospect not found",
};

function describeReason(reason: string): string {
  return REASON_LABELS[reason] ?? reason.replace(/_/g, " ");
}

function describeError(err: unknown): string {
  if (err instanceof TypeError) {
    return "Couldn't reach the backend. Is Rails running on :3001?";
  }
  const e = err as { error?: string; status?: number };
  if (e.error) return e.error;
  if (e.status) return `Server returned ${e.status}.`;
  return "Something went wrong.";
}

interface Props {
  prospectIds: number[];
  /** Display labels for blocked-list rendering (id → email). */
  prospectLabels: Record<number, string>;
  onClose: () => void;
  /** Called after a successful push. Receives the summary for follow-up display. */
  onPushed: (summary: PushSummary) => void;
}

export function PushToCampaignModal({
  prospectIds,
  prospectLabels,
  onClose,
  onPushed,
}: Props) {
  const { apiFetch } = useAuth();
  const [campaigns, setCampaigns] = useState<SmartleadCampaign[] | null>(null);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [preflightError, setPreflightError] = useState<string | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  // ESC to close
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && !pushing) onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose, pushing]);

  // Load campaigns once
  useEffect(() => {
    campaignsApi
      .list(apiFetch)
      .then((list) => {
        setCampaigns(list);
        // Auto-select first ACTIVE campaign for convenience
        const active = list.find((c) => c.status === "ACTIVE");
        if (active) setCampaignId(active.smartlead_id);
        else if (list[0]) setCampaignId(list[0].smartlead_id);
      })
      .catch((e) => setCampaignsError(describeError(e)));
  }, [apiFetch]);

  // Run preflight whenever the campaign selection changes
  useEffect(() => {
    if (!campaignId) {
      setPreflight(null);
      return;
    }
    let cancelled = false;
    setPreflight(null);
    setPreflightError(null);
    setPreflightLoading(true);
    campaignsApi
      .preflight(apiFetch, campaignId, prospectIds)
      .then((r) => {
        if (!cancelled) setPreflight(r);
      })
      .catch((e) => {
        if (!cancelled) setPreflightError(describeError(e));
      })
      .finally(() => {
        if (!cancelled) setPreflightLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiFetch, campaignId, prospectIds]);

  async function onPush() {
    if (!campaignId || !preflight || preflight.ready.length === 0) return;
    setPushing(true);
    setPushError(null);
    try {
      const summary = await campaignsApi.push(apiFetch, campaignId, prospectIds);
      onPushed(summary);
    } catch (e) {
      setPushError(describeError(e));
      setPushing(false);
    }
  }

  const selectedCampaign = useMemo(
    () => campaigns?.find((c) => c.smartlead_id === campaignId) ?? null,
    [campaigns, campaignId],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => { if (!pushing) onClose(); }}
    >
      <div
        className="flex w-full max-w-xl flex-col rounded-xl border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              Push to Smartlead campaign
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              {prospectIds.length} prospect{prospectIds.length === 1 ? "" : "s"} selected.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={pushing}
            className="rounded-md p-1 text-muted hover:bg-black/5 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        <div className="max-h-[60vh] overflow-y-auto px-6 pb-2">
          <label className="block">
            <span className="mb-1.5 inline-block text-[13px] font-medium text-foreground">
              Campaign
            </span>
            {campaigns === null && !campaignsError ? (
              <div className="flex items-center gap-2 text-[13px] text-muted">
                <Loader2 size={14} className="animate-spin" />
                Loading campaigns…
              </div>
            ) : campaignsError ? (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{campaignsError}</span>
              </div>
            ) : campaigns && campaigns.length === 0 ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                No synced campaigns. Sync from the Campaigns tab first.
              </p>
            ) : (
              <Select
                value={campaignId ?? ""}
                onChange={(e) => setCampaignId(Number(e.target.value) || null)}
              >
                {(campaigns ?? []).map((c) => (
                  <option key={c.smartlead_id} value={c.smartlead_id}>
                    {c.name || "(no name)"} — {c.status ?? "?"}
                  </option>
                ))}
              </Select>
            )}
          </label>

          {selectedCampaign && (
            <section className="mt-5">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
                Preflight check
              </h3>

              {preflightLoading && (
                <div className="mt-3 flex items-center gap-2 text-[13px] text-muted">
                  <Loader2 size={14} className="animate-spin" />
                  Checking which prospects are ready…
                </div>
              )}

              {preflightError && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{preflightError}</span>
                </div>
              )}

              {preflight && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-800">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    <span>
                      <strong>{preflight.ready.length}</strong>{" "}
                      ready to push to <strong>{selectedCampaign.name}</strong>.
                    </span>
                  </div>

                  {preflight.blocked.length > 0 && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                        <span>
                          <strong>{preflight.blocked.length}</strong>{" "}
                          will be skipped:
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1 pl-6 text-[12px]">
                        {preflight.blocked.map((b) => (
                          <li key={b.prospect_id}>
                            <span className="font-medium">
                              {prospectLabels[b.prospect_id] ?? `Prospect #${b.prospect_id}`}
                            </span>{" "}
                            — {b.reasons.map(describeReason).join("; ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {pushError && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{pushError}</span>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-border p-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pushing}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onPush}
            disabled={pushing || !preflight || preflight.ready.length === 0}
          >
            {pushing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Pushing…
              </>
            ) : (
              <>
                <Rocket size={14} />
                Push {preflight?.ready.length ?? 0} ready
              </>
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
}
