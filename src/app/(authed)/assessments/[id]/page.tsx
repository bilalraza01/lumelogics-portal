"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import {
  assessmentsApi,
  type AssessmentDetail,
  type DimensionScore,
} from "@/lib/api/assessments";
import {
  ARCHETYPE_LABELS,
  DIMENSION_LABELS,
  QUESTIONS,
  QUESTIONS_BY_ID,
} from "@/lib/assessment/questions";
import { useAuth } from "@/lib/auth";

const ARCHETYPE_TONE: Record<string, string> = {
  wishful_thinker:       "bg-red-50 text-red-700",
  aspirational_operator: "bg-amber-50 text-amber-700",
  coordinated_operator:  "bg-blue-50 text-blue-700",
  build_ready_operator:  "bg-emerald-50 text-emerald-700",
  optimization_operator: "bg-purple-50 text-purple-700",
};

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

export default function AssessmentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { apiFetch } = useAuth();
  const [data, setData]       = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<"not_found" | "load_failed" | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    assessmentsApi
      .get(apiFetch, id)
      .then((a) => {
        if (!cancelled) setData(a);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message === "request_failed_404" ? "not_found" : "load_failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [apiFetch, id]);

  if (loading) {
    return (
      <div className="px-8 py-10 text-muted">
        <Loader2 size={18} className="mr-2 inline animate-spin" />
        <span className="text-sm">Loading assessment…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-8 py-10">
        <Link href="/assessments" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
          <ArrowLeft size={14} />Back to assessments
        </Link>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-[15px] font-semibold text-red-900">
            {error === "not_found" ? "Assessment not found" : "Couldn't load this assessment"}
          </h2>
        </div>
      </div>
    );
  }

  const resultsUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://lumelogics.com"}/free-assessment/results/${data.result_token}`;

  // Group questions by dimension so the answer view follows the scoring structure.
  const dimensions = Object.keys(DIMENSION_LABELS);

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/assessments" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
          <ArrowLeft size={14} />Back to assessments
        </Link>

        <header className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-all text-[28px] font-semibold tracking-tight text-foreground">
              {data.email}
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              Submitted {formatDateTime(data.created_at)}
              {data.referral_source && <> · referral: {data.referral_source}</>}
            </p>
          </div>
          <a
            href={resultsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[13px] text-brand-700 hover:text-brand-900 hover:underline"
          >
            View public results page
            <ExternalLink size={13} />
          </a>
        </header>

        {/* Score + archetype headline card */}
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
                Total score
              </p>
              <p className="mt-2 text-[48px] font-semibold leading-none tracking-tight text-foreground">
                {data.total_score}
                <span className="ml-1 text-[20px] font-normal text-muted">/ 100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
                Archetype
              </p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-[14px] font-medium ${ARCHETYPE_TONE[data.archetype] ?? "bg-black/[0.06] text-foreground"}`}
              >
                {ARCHETYPE_LABELS[data.archetype] ?? data.archetype}
              </span>
            </div>
          </div>

          {/* Dimension scores */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {dimensions.map((dim) => {
              const score = data.dimension_scores[dim] as DimensionScore | undefined;
              if (!score) return null;
              const pct = Math.round((score.scaled / score.max) * 100);
              return (
                <div key={dim} className="rounded-lg border border-border bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-medium text-foreground">
                      {DIMENSION_LABELS[dim] ?? dim}
                    </span>
                    <span className="font-mono text-[13px] tabular-nums text-foreground">
                      {score.scaled}<span className="text-muted">/{score.max}</span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
                    <div
                      className="h-full rounded-full bg-brand-400 transition-[width] duration-500"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Answers grouped by dimension */}
        <section className="mt-8">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
            Answers
          </h2>

          {dimensions.map((dim) => {
            const dimQuestions = QUESTIONS.filter((q) => q.dimension === dim);
            return (
              <div key={dim} className="mt-5">
                <h3 className="text-[13px] font-semibold text-foreground">
                  {DIMENSION_LABELS[dim] ?? dim}
                </h3>
                <ol className="mt-3 space-y-3">
                  {dimQuestions.map((q) => {
                    const value = data.answers[q.id];
                    const chosen = value !== undefined
                      ? q.options.find((o) => o.value === value)
                      : undefined;
                    return (
                      <li key={q.id} className="rounded-lg border border-border bg-surface px-4 py-3">
                        <p className="text-[13px] text-foreground">
                          <span className="font-mono text-[11px] text-muted">{q.id.toUpperCase()}</span>{" "}
                          {q.prompt}
                        </p>
                        <p className="mt-1.5 text-[13px]">
                          <span className="text-muted">Answer:</span>{" "}
                          {chosen ? (
                            <>
                              <span className="text-foreground">{chosen.label}</span>{" "}
                              <span className="font-mono text-[12px] text-muted">({chosen.value}/5)</span>
                            </>
                          ) : value !== undefined ? (
                            <span className="font-mono text-foreground">{value}/5</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </section>

        {/* Meta footer */}
        <section className="mt-10 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">Meta</h2>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
            <Meta label="Email send time">{data.email_sent_at ? formatDateTime(data.email_sent_at) : "Not yet sent"}</Meta>
            <Meta label="IP address">{data.ip_address || "—"}</Meta>
            <Meta label="Result token"><code className="font-mono text-[11px]">{data.result_token}</code></Meta>
            <Meta label="User agent" wide><span className="break-all">{data.user_agent || "—"}</span></Meta>
          </dl>
        </section>
      </div>
    </div>
  );
}

function Meta({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-muted">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
