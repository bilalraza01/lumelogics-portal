"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { leadsApi, type LeadDetail } from "@/lib/api/leads";
import { useAuth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ email: string }>;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function LeadDetailPage({ params }: PageProps) {
  const { email: rawEmail } = use(params);
  const email = decodeURIComponent(rawEmail);
  const { apiFetch } = useAuth();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"not_found" | "load_failed" | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    leadsApi
      .get(apiFetch, email)
      .then((l) => {
        if (!cancelled) setLead(l);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(
            err.message === "request_failed_404" ? "not_found" : "load_failed",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiFetch, email]);

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to leads
        </Link>

        {loading && (
          <div className="mt-10 flex items-center text-muted">
            <Loader2 size={18} className="mr-2 animate-spin" />
            <span className="text-sm">Loading lead…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-[15px] font-semibold text-red-900">
              {error === "not_found"
                ? "No requests from this email"
                : "Couldn't load this lead"}
            </h2>
            <p className="mt-1 text-[13px] text-red-800">
              {error === "not_found"
                ? "Either the address is mistyped or they haven't requested anything yet."
                : "Try again in a moment."}
            </p>
          </div>
        )}

        {!loading && lead && (
          <>
            <header className="mt-3">
              <h1 className="break-all text-[28px] font-semibold tracking-tight text-foreground">
                {lead.email}
              </h1>
              <p className="mt-2 text-[14px] text-muted">
                <span className="font-medium text-foreground">
                  {lead.verified_count}
                </span>
                <span> verified of </span>
                <span className="font-medium text-foreground">
                  {lead.request_count}
                </span>
                <span> resource{lead.request_count === 1 ? "" : "s"} requested</span>
                <span className="mx-2 text-border">·</span>
                first seen {formatDate(lead.first_seen_at)}
                <span className="mx-2 text-border">·</span>
                last seen {formatDate(lead.last_seen_at)}
              </p>
            </header>

            <section className="mt-8">
              <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
                Resources
              </h2>
              <ul className="mt-4 space-y-3">
                {lead.requests.map((r) => {
                  const verified = r.verified_at !== null;
                  return (
                    <li
                      key={r.id}
                      className="rounded-xl border border-border bg-surface p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/lead-magnets/${r.magnet.id}`}
                            className="text-[15px] font-semibold text-foreground hover:text-brand-700"
                          >
                            {r.magnet.title}
                          </Link>
                          <p className="mt-0.5 font-mono text-[12px] text-muted">
                            /free/{r.magnet.slug}
                          </p>
                        </div>
                        <span
                          className={
                            verified
                              ? "inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700"
                              : "inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-700"
                          }
                        >
                          {verified ? (
                            <>
                              <CheckCircle2 size={13} />
                              Verified
                            </>
                          ) : (
                            <>
                              <Circle size={13} />
                              Not verified
                            </>
                          )}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                        <div>
                          <dt className="text-muted">Requested</dt>
                          <dd className="text-foreground">{formatDateTime(r.created_at)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Verified</dt>
                          <dd className="text-foreground">
                            {verified ? formatDateTime(r.verified_at!) : "—"}
                          </dd>
                        </div>
                        {r.referral_source && (
                          <div className="sm:col-span-2">
                            <dt className="text-muted">Referral</dt>
                            <dd className="text-foreground">{r.referral_source}</dd>
                          </div>
                        )}
                      </dl>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
