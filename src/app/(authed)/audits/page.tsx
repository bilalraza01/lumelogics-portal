"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { auditsApi, type AdminAuditListItem } from "@/lib/api/audits";
import { useAuth } from "@/lib/auth";

const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "";

const STATUS_STYLES: Record<string, string> = {
  in_progress: "bg-amber-50 text-amber-700",
  in_review: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-700",
  archived: "bg-black/[0.05] text-muted",
};

export default function AuditsIndexPage() {
  const { apiFetch } = useAuth();
  const [audits, setAudits] = useState<AdminAuditListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditsApi.list(apiFetch);
      setAudits(res.data);
    } catch {
      setError("Could not load audits.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(a: AdminAuditListItem) {
    const confirmed = window.confirm(
      `Delete the audit for "${a.client_name}" (/audit/${a.slug})? This cannot be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(a.id);
    try {
      await auditsApi.destroy(apiFetch, a.id);
      setAudits((curr) => curr.filter((x) => x.id !== a.id));
    } catch {
      window.alert("Delete failed. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
              Audits
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              Client audit deliverables shown at lumelogics.com/audit/&lt;slug&gt;.
            </p>
          </div>
          <ButtonLink href="/audits/new">
            <Plus size={16} />
            New audit
          </ButtonLink>
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
              <Button size="sm" variant="outline" className="mt-3" onClick={load}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && audits.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] text-foreground">No audits yet.</p>
              <p className="mt-1 text-[13px] text-muted">
                Create one to deliver to a client.
              </p>
              <ButtonLink href="/audits/new" className="mt-5" size="sm">
                <Plus size={14} />
                Create your first audit
              </ButtonLink>
            </div>
          )}

          {!loading && !error && audits.length > 0 && (
            <table className="w-full table-auto text-left text-[14px]">
              <thead className="bg-black/[0.025] text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-5 py-3 text-foreground">
                      {a.client_name}
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-foreground">
                      {a.slug}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[12px] font-medium ${
                          STATUS_STYLES[a.status] ?? "bg-black/[0.05] text-muted"
                        }`}
                      >
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(a.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`${FRONTEND}/audit/${a.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-foreground hover:bg-black/5"
                        >
                          <ExternalLink size={13} />
                          Preview
                        </a>
                        <Link
                          href={`/audits/${a.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-foreground hover:bg-black/5"
                        >
                          <Pencil size={13} />
                          Edit
                        </Link>
                        <button
                          onClick={() => onDelete(a)}
                          disabled={deletingId === a.id}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingId === a.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
