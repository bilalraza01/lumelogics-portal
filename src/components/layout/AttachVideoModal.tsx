"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { videosApi, type ApiFailure } from "@/lib/api/videos";
import { useAuth } from "@/lib/auth";

function describeError(err: unknown): string {
  if (err instanceof TypeError) {
    // fetch() throws TypeError on network failure / CORS / DNS / connection refused.
    return "Couldn't reach the backend. Check that the Rails server is running on :3001 and try again.";
  }
  const e = err as ApiFailure;
  if (e.errors) {
    const messages = Object.entries(e.errors).flatMap(([field, msgs]) =>
      msgs.map((m) => `${field} ${m}`),
    );
    if (messages.length > 0) return messages.join(". ");
  }
  if (e.error) return e.error;
  if (e.status) return `Server returned ${e.status}. Check the Rails logs.`;
  return "Could not attach video.";
}

interface Props {
  prospectId: number;
  prospectEmail: string;
  /** "attach" for first video, "reattach" for retrying after failure. */
  mode: "attach" | "reattach";
  /** If reattaching, the failed video's batch_id to prefill. */
  initialBatchId?: number | null;
  onClose: () => void;
  /** Called after a successful POST. Receives the new video id. */
  onAttached: () => void;
}

export function AttachVideoModal({
  prospectId,
  prospectEmail,
  mode,
  initialBatchId,
  onClose,
  onAttached,
}: Props) {
  const { apiFetch } = useAuth();
  const [loomUrl, setLoomUrl] = useState("");
  const [batchId, setBatchId] = useState(initialBatchId != null ? String(initialBatchId) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await videosApi.create(apiFetch, prospectId, {
        loom_url: loomUrl.trim(),
        batch_id: batchId.trim() ? Number(batchId.trim()) : null,
      });
      onAttached();
    } catch (err) {
      setError(describeError(err));
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => { if (!submitting) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              {mode === "reattach" ? "Re-attach video" : "Attach a Loom video"}
            </h2>
            <p className="mt-1 text-[13px] text-muted">{prospectEmail}</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-md p-1 text-muted hover:bg-black/5 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <Field label="Loom URL" required>
            <Input
              type="url"
              value={loomUrl}
              onChange={(e) => setLoomUrl(e.target.value)}
              placeholder="https://www.loom.com/share/…"
              required
              autoFocus
            />
          </Field>
          <Field label="Batch ID" hint="Optional. Groups videos under a campaign batch.">
            <Input
              type="number"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="e.g. 1"
            />
          </Field>

          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !loomUrl.trim()}>
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" />Enqueueing…</>
              ) : (
                mode === "reattach" ? "Re-attach" : "Attach + start pipeline"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
