"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { AuditForm } from "@/components/audit/AuditForm";
import { auditsApi, type AdminAudit } from "@/lib/api/audits";
import { useAuth } from "@/lib/auth";

const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAuditPage({ params }: PageProps) {
  const { id } = use(params);
  const { apiFetch } = useAuth();
  const [audit, setAudit] = useState<AdminAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    auditsApi
      .get(apiFetch, id)
      .then((a) => {
        if (!cancelled) setAudit(a);
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
  }, [apiFetch, id]);

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/audits"
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to audits
        </Link>

        {loading && (
          <div className="mt-10 flex items-center text-muted">
            <Loader2 size={18} className="mr-2 animate-spin" />
            <span className="text-sm">Loading audit…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-[15px] font-semibold text-red-900">
              {error === "not_found"
                ? "Audit not found"
                : "Couldn't load this audit"}
            </h2>
            <p className="mt-1 text-[13px] text-red-800">
              {error === "not_found"
                ? "It may have been deleted. Return to the list and try again."
                : "Try again in a moment."}
            </p>
          </div>
        )}

        {!loading && audit && (
          <>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
                  {audit.client_name}
                </h1>
                <p className="mt-1 text-[14px] text-muted">
                  <code className="rounded bg-black/[0.05] px-1 py-0.5 text-[12px]">
                    /audit/{audit.slug}
                  </code>
                </p>
              </div>
              <a
                href={`${FRONTEND}/audit/${audit.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[13px] text-foreground hover:bg-black/5"
              >
                <ExternalLink size={14} />
                Preview
              </a>
            </div>
            <div className="mt-8">
              <AuditForm mode="edit" audit={audit} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
