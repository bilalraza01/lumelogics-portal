"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MagnetForm } from "@/components/layout/MagnetForm";
import {
  leadMagnetsApi,
  type AdminLeadMagnet,
} from "@/lib/api/lead-magnets";
import { useAuth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditMagnetPage({ params }: PageProps) {
  const { id } = use(params);
  const { apiFetch } = useAuth();
  const [magnet, setMagnet] = useState<AdminLeadMagnet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    leadMagnetsApi
      .get(apiFetch, id)
      .then((m) => {
        if (!cancelled) setMagnet(m);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message === "request_failed_404" ? "not_found" : "load_failed");
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
      <div className="mx-auto max-w-3xl">
        <Link
          href="/lead-magnets"
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to lead magnets
        </Link>

        {loading && (
          <div className="mt-10 flex items-center text-muted">
            <Loader2 size={18} className="mr-2 animate-spin" />
            <span className="text-sm">Loading magnet…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-[15px] font-semibold text-red-900">
              {error === "not_found" ? "Magnet not found" : "Couldn't load this magnet"}
            </h2>
            <p className="mt-1 text-[13px] text-red-800">
              {error === "not_found"
                ? "It may have been deleted. Return to the list and try again."
                : "Try again in a moment."}
            </p>
          </div>
        )}

        {!loading && magnet && (
          <>
            <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-foreground">
              {magnet.title}
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              <code className="rounded bg-black/[0.05] px-1 py-0.5 text-[12px]">
                /free/{magnet.slug}
              </code>{" "}
              · {magnet.request_count} request(s) captured
            </p>
            <div className="mt-8">
              <MagnetForm mode="edit" magnet={magnet} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
