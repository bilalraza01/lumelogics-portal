"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  leadMagnetsApi,
  type AdminLeadMagnet,
} from "@/lib/api/lead-magnets";
import { useAuth } from "@/lib/auth";

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  google_doc: "Google Doc",
  google_sheet: "Google Sheet",
  external_url: "External URL",
};

// Public opt-in (email gate) page on the marketing site.
const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "";
const optinUrl = (slug: string) => `${FRONTEND}/free/${slug}`;

export default function LeadMagnetsIndexPage() {
  const { apiFetch } = useAuth();
  const [magnets, setMagnets] = useState<AdminLeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function onCopy(m: AdminLeadMagnet) {
    const url = optinUrl(m.slug);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API blocked (e.g. non-secure context): let them copy by hand.
      window.prompt("Copy this opt-in URL:", url);
      return;
    }
    setCopiedId(m.id);
    setTimeout(
      () => setCopiedId((cur) => (cur === m.id ? null : cur)),
      1600,
    );
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadMagnetsApi.list(apiFetch);
      setMagnets(res.data);
    } catch {
      setError("Could not load lead magnets.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(m: AdminLeadMagnet) {
    const confirmed = window.confirm(
      `Delete "${m.title}"? This also removes all ${m.request_count} request(s) and cannot be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(m.id);
    try {
      await leadMagnetsApi.destroy(apiFetch, m.id);
      setMagnets((curr) => curr.filter((x) => x.id !== m.id));
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
              Lead Magnets
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              Create, edit and remove resources captured at lumelogics.com/free/&lt;slug&gt;.
            </p>
          </div>
          <ButtonLink href="/lead-magnets/new">
            <Plus size={16} />
            New magnet
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
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={load}
              >
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && magnets.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] text-foreground">No lead magnets yet.</p>
              <p className="mt-1 text-[13px] text-muted">Create one to share with prospects.</p>
              <ButtonLink href="/lead-magnets/new" className="mt-5" size="sm">
                <Plus size={14} />
                Create your first magnet
              </ButtonLink>
            </div>
          )}

          {!loading && !error && magnets.length > 0 && (
            <table className="w-full table-auto text-left text-[14px]">
              <thead className="bg-black/[0.025] text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Requests</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {magnets.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-5 py-3 font-mono text-[12px] text-foreground">
                      {m.slug}
                    </td>
                    <td className="px-5 py-3 text-foreground">{m.title}</td>
                    <td className="px-5 py-3 text-muted">
                      {TYPE_LABELS[m.resource_type] ?? m.resource_type}
                    </td>
                    <td className="px-5 py-3 text-muted">{m.request_count}</td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(m.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onCopy(m)}
                          title={`Copy opt-in link: ${optinUrl(m.slug)}`}
                          aria-label="Copy opt-in link"
                          className="inline-flex cursor-pointer items-center rounded-md p-1.5 text-foreground hover:bg-black/5"
                        >
                          {copiedId === m.id ? (
                            <Check size={15} className="text-emerald-600" />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                        <Link
                          href={`/lead-magnets/${m.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-foreground hover:bg-black/5"
                        >
                          <Pencil size={13} />
                          Edit
                        </Link>
                        <button
                          onClick={() => onDelete(m)}
                          disabled={deletingId === m.id}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingId === m.id ? (
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
