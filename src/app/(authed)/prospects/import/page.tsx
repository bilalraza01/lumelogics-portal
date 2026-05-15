"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { importsApi, type ImportSummary } from "@/lib/api/imports";
import { useAuth } from "@/lib/auth";

export default function ImportProspectsPage() {
  const router = useRouter();
  const { apiFetch } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const summary = await importsApi.uploadProspects(apiFetch, file);
      setResult(summary);
    } catch (err) {
      const e = err as Error & { error?: string };
      setError(e.error ?? "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/prospects"
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to prospects
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-foreground">
          Import prospects from CSV
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          Required column: <code className="rounded bg-black/[0.05] px-1 py-0.5 text-[12px]">email</code>.
          Optional: <code className="text-[12px]">first_name, last_name, company_name, linkedin_url, website, notes</code>.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <section className="rounded-xl border border-border bg-surface p-6">
            <Field label="CSV file" required>
              <label className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-border bg-background px-4 py-6 text-sm text-muted hover:border-brand-300 hover:text-brand-700">
                <span className="flex items-center gap-2">
                  <FileUp size={18} />
                  {file ? file.name : "Choose a CSV file…"}
                </span>
                <span className="text-[12px] text-muted">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "Required"}
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </Field>
          </section>

          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <ButtonLink href="/prospects" variant="ghost">Cancel</ButtonLink>
            <Button type="submit" disabled={!file || submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" />Importing…</> : "Import"}
            </Button>
          </div>
        </form>

        {result && (
          <section className="mt-8 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Import summary</h2>
            <dl className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-emerald-50 p-4">
                <dt className="text-[12px] uppercase tracking-wider text-emerald-700">Created</dt>
                <dd className="mt-1 text-[24px] font-semibold text-emerald-900">{result.created}</dd>
              </div>
              <div className="rounded-lg bg-amber-50 p-4">
                <dt className="text-[12px] uppercase tracking-wider text-amber-700">Skipped (already exist)</dt>
                <dd className="mt-1 text-[24px] font-semibold text-amber-900">{result.skipped}</dd>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <dt className="text-[12px] uppercase tracking-wider text-red-700">Errors</dt>
                <dd className="mt-1 text-[24px] font-semibold text-red-900">{result.errors.length}</dd>
              </div>
            </dl>

            {result.errors.length > 0 && (
              <div className="mt-5">
                <h3 className="text-[13px] font-semibold text-foreground">Row errors</h3>
                <ul className="mt-2 space-y-1 text-[13px] text-red-800">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      Row {err.row}: <code className="text-[12px]">{err.email ?? "—"}</code> — {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <Button onClick={() => router.push("/prospects")}>Done</Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
