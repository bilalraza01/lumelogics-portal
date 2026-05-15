"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { leadsApi, type LeadSummary } from "@/lib/api/leads";
import { useAuth } from "@/lib/auth";

function relativeDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function LeadsIndexPage() {
  const router = useRouter();
  const { apiFetch } = useAuth();
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (q: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await leadsApi.list(apiFetch, { q: q || undefined });
        setLeads(res.data);
      } catch {
        setError("Could not load leads.");
      } finally {
        setLoading(false);
      }
    },
    [apiFetch],
  );

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => load(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query, load]);

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
              Leads
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              Everyone who&apos;s entered an email at <code className="rounded bg-black/[0.05] px-1 py-0.5 text-[12px]">/free/&lt;slug&gt;</code>, grouped by person.
            </p>
          </div>
          <div className="relative w-64">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email…"
              className="block w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[14px] text-foreground placeholder:text-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </header>

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
          {loading && (
            <div className="flex items-center justify-center py-16 text-muted">
              <Loader2 size={18} className="mr-2 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {!loading && error && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => load(query.trim())}
              >
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && leads.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] text-foreground">
                {query ? "No leads match that search." : "No leads yet."}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {query
                  ? "Try a different query."
                  : "When someone requests a resource at /free/<slug> they'll show up here."}
              </p>
            </div>
          )}

          {!loading && !error && leads.length > 0 && (
            <table className="w-full table-auto text-left text-[14px]">
              <thead className="bg-black/[0.025] text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Resources</th>
                  <th className="px-5 py-3 font-medium">Last seen</th>
                  <th className="px-5 py-3 font-medium">First seen</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const allVerified = l.verified_count === l.request_count;
                  return (
                    <tr
                      key={l.email}
                      onClick={() =>
                        router.push(`/leads/${encodeURIComponent(l.email)}`)
                      }
                      className="cursor-pointer border-t border-border transition-colors hover:bg-brand-50/40"
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {l.email}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        <span
                          className={
                            allVerified
                              ? "text-foreground"
                              : "text-foreground"
                          }
                        >
                          {l.verified_count}
                        </span>
                        <span className="text-muted"> / {l.request_count}</span>
                        <span className="ml-1 text-[12px] text-muted">verified</span>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {relativeDate(l.last_seen_at)}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {relativeDate(l.first_seen_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
