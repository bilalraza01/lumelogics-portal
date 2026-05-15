"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { videosApi } from "@/lib/api/videos";
import { useAuth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AttachVideoPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const prospectId = Number(rawId);
  const router = useRouter();
  const { apiFetch } = useAuth();
  const [loomUrl, setLoomUrl] = useState("");
  const [batchId, setBatchId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await videosApi.create(apiFetch, prospectId, {
        loom_url: loomUrl.trim(),
        batch_id: batchId.trim() ? Number(batchId.trim()) : null,
      });
      router.push(`/prospects/${prospectId}`);
      router.refresh();
    } catch (err) {
      const e = err as Error & { error?: string };
      setError(e.error ?? "Could not attach video.");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/prospects/${prospectId}`}
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />Back to prospect
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-foreground">Attach a Loom video</h1>
        <p className="mt-1 text-[14px] text-muted">
          The worker downloads the Loom, transcodes a preview GIF, uploads both to R2, and marks the video <code className="text-[12px]">ready</code>.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <section className="rounded-xl border border-border bg-surface p-6 space-y-5">
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
            <Field label="Batch ID" hint="Optional. Groups videos under a campaign batch; defaults to no batch.">
              <Input
                type="number"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="e.g. 1"
              />
            </Field>
          </section>

          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <ButtonLink href={`/prospects/${prospectId}`} variant="ghost">Cancel</ButtonLink>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" />Enqueueing…</> : "Attach + start pipeline"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
