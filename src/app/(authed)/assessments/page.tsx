"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  ARCHETYPES,
  assessmentsApi,
  type Archetype,
  type AssessmentSummary,
} from "@/lib/api/assessments";
import { ARCHETYPE_LABELS } from "@/lib/assessment/questions";
import { useAuth } from "@/lib/auth";

const ARCHETYPE_TONE: Record<Archetype, string> = {
  wishful_thinker:       "bg-red-50 text-red-700",
  aspirational_operator: "bg-amber-50 text-amber-700",
  coordinated_operator:  "bg-blue-50 text-blue-700",
  build_ready_operator:  "bg-emerald-50 text-emerald-700",
  optimization_operator: "bg-purple-50 text-purple-700",
};

function scoreColor(total: number): string {
  if (total >= 76) return "text-emerald-700";
  if (total >= 56) return "text-blue-700";
  if (total >= 36) return "text-amber-700";
  return "text-red-700";
}

export default function AssessmentsIndexPage() {
  const { apiFetch } = useAuth();
  const [items, setItems]               = useState<AssessmentSummary[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [archetypeFilter, setArchetypeFilter] = useState<"" | Archetype>("");
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState(50);
  const [total, setTotal]               = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assessmentsApi.list(apiFetch, {
        archetype: (archetypeFilter || undefined) as Archetype | undefined,
        page,
      });
      setItems(res.data);
      setTotal(res.pagination.total);
      setPerPage(res.pagination.per_page);
    } catch {
      setError("Could not load assessments.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, archetypeFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change.
  useEffect(() => {
    setPage(1);
  }, [archetypeFilter]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(total, page * perPage);

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
              Assessments
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              Submissions from the free AI Readiness Assessment at lumelogics.com/free-assessment.
            </p>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="w-60">
            <Select
              value={archetypeFilter}
              onChange={(e) => setArchetypeFilter(e.target.value as Archetype | "")}
            >
              <option value="">All archetypes</option>
              {ARCHETYPES.map((a) => (
                <option key={a} value={a}>{ARCHETYPE_LABELS[a] ?? a}</option>
              ))}
            </Select>
          </div>
          <span className="text-[12px] text-muted">
            {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
          </span>
        </div>

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

          {!loading && !error && items.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] text-foreground">No assessments match.</p>
              <p className="mt-1 text-[13px] text-muted">
                {archetypeFilter
                  ? "Try clearing the archetype filter."
                  : "When someone submits the readiness assessment they'll show up here."}
              </p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <table className="w-full table-auto text-left text-[14px]">
              <thead className="bg-black/[0.025] text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Archetype</th>
                  <th className="px-5 py-3 font-medium">Referral</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t border-border hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <Link href={`/assessments/${a.id}`} className="font-medium text-foreground hover:text-brand-700">
                        {a.email}
                      </Link>
                    </td>
                    <td className={`px-5 py-3 font-mono text-[14px] tabular-nums ${scoreColor(a.total_score)}`}>
                      {a.total_score}<span className="text-muted">/100</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium ${ARCHETYPE_TONE[a.archetype]}`}>
                        {ARCHETYPE_LABELS[a.archetype] ?? a.archetype}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">{a.referral_source || "—"}</td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={14} />
              Previous
            </Button>
            <span className="text-[12px] text-muted">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
