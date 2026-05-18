"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import {
  auditsApi,
  type AdminAudit,
  type AuditDocument,
} from "@/lib/api/audits";
import { Section, type AuditMeta, type AuditRefs } from "./_kit";
import { defaultContent, validateDoc } from "./defaults";
import {
  AiMomentSection,
  DeliverablesSection,
  DownloadsSection,
  FooterSection,
  HeroSection,
  JourneySection,
  MetaSection,
  PrototypeSection,
} from "./sections/Basic";
import { SessionsSection } from "./sections/Sessions";
import { ProcessMapSection } from "./sections/ProcessMap";
import { CategoriesSection, FindingsSection } from "./sections/Findings";
import { WasteSection } from "./sections/Waste";
import { BlueprintSection } from "./sections/Blueprint";
import { ReportSection } from "./sections/Report";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const FRONTEND = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "";

function metaFromAudit(a: AdminAudit): AuditMeta {
  return {
    slug: a.slug,
    client_name: a.client_name,
    industry: a.industry ?? "",
    status: a.status,
    started_on: a.started_on ?? "",
    completed_on: a.completed_on ?? "",
  };
}

export function AuditForm({
  mode,
  audit,
}: {
  mode: "create" | "edit";
  audit?: AdminAudit;
}) {
  const router = useRouter();
  const { apiFetch } = useAuth();

  const [meta, setMeta] = useState<AuditMeta>(
    audit
      ? metaFromAudit(audit)
      : {
          slug: "",
          client_name: "",
          industry: "",
          status: "in_progress",
          started_on: "",
          completed_on: "",
        },
  );
  const [content, setContent] = useState<AuditDocument>(
    audit ? audit.content : defaultContent(),
  );

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [genericError, setGenericError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const opt = (id: string, label: string) => ({
    value: id,
    label: `${id} (${label})`,
  });
  const refs: AuditRefs = useMemo(
    () => ({
      sessions: content.sessions.map((s) => opt(s.id, s.badge)),
      categories: content.categories.map((c) => opt(c.id, c.label)),
      pains: content.findings.pain_points.map((p) => opt(p.ref_id, p.title)),
      wastes: content.waste.opportunities.map((w) => opt(w.ref_id, w.title)),
      domains: content.blueprint.domains.map((d) => opt(d.id, d.label)),
      layers: content.blueprint.framework_layers.map((l) => opt(l.id, l.label)),
      solutionTypes: content.blueprint.solution_types.map((s) =>
        opt(s.id, s.label),
      ),
      team: content.process_map.team.map((t) => opt(t.id, t.name)),
      tools: content.process_map.tools.map((t) => opt(t.id, t.name)),
      blueprintOpps: content.blueprint.opportunities.map((o) =>
        opt(o.ref_id, o.title),
      ),
    }),
    [content],
  );

  const { errors: refErrors, warnings } = useMemo(
    () => validateDoc(content),
    [content],
  );

  function setKey<K extends keyof AuditDocument>(
    k: K,
    v: AuditDocument[K],
  ) {
    setContent((c) => ({ ...c, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGenericError(null);

    const fieldErrors: Record<string, string[]> = {};
    if (!SLUG_RE.test(meta.slug))
      fieldErrors.slug = ["Lowercase letters, numbers and hyphens only."];
    if (!meta.client_name.trim())
      fieldErrors.client_name = ["Required."];
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (refErrors.length > 0) {
      setGenericError(
        "Fix the cross-reference errors listed below before saving.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        slug: meta.slug,
        client_name: meta.client_name,
        industry: meta.industry || null,
        status: meta.status,
        started_on: meta.started_on || null,
        completed_on: meta.completed_on || null,
        content,
      };
      if (mode === "create") {
        await auditsApi.create(apiFetch, payload);
      } else if (audit) {
        await auditsApi.update(apiFetch, audit.id, payload);
      }
      router.push("/audits");
      router.refresh();
    } catch (err) {
      const e2 = err as Error & { errors?: Record<string, string[]> };
      if (e2.errors) setErrors(e2.errors);
      else setGenericError("Could not save. Check the fields and try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-28">
      {genericError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
        >
          {genericError}
        </div>
      )}
      {errors.content && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
        >
          Server rejected the document: {errors.content.join(", ")}
        </div>
      )}
      {refErrors.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <p className="font-semibold">
            {refErrors.length} cross-reference issue(s) (blocks save):
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {refErrors.slice(0, 12).map((m, i) => (
              <li key={i}>{m}</li>
            ))}
            {refErrors.length > 12 && <li>and {refErrors.length - 12} more…</li>}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      <Section title="Basics" subtitle="Slug, client, status, dates" defaultOpen>
        <MetaSection value={meta} onChange={setMeta} errors={errors} />
      </Section>
      <Section title="Hero">
        <HeroSection value={content.hero} onChange={(v) => setKey("hero", v)} />
      </Section>
      <Section title="The AI moment">
        <AiMomentSection
          value={content.ai_moment}
          onChange={(v) => setKey("ai_moment", v)}
        />
      </Section>
      <Section title="Journey stepper" badge={`${content.journey.stages.length}`}>
        <JourneySection
          value={content.journey.stages}
          onChange={(v) => setKey("journey", { stages: v })}
        />
      </Section>
      <Section title="Sessions" badge={`${content.sessions.length}`}>
        <SessionsSection
          value={content.sessions}
          onChange={(v) => setKey("sessions", v)}
        />
      </Section>
      <Section title="Deliverable cards" badge={`${content.deliverables.length}`}>
        <DeliverablesSection
          value={content.deliverables}
          onChange={(v) => setKey("deliverables", v)}
        />
      </Section>
      <Section title="Downloads" badge={`${content.downloads.length}`}>
        <DownloadsSection
          value={content.downloads}
          onChange={(v) => setKey("downloads", v)}
        />
      </Section>
      <Section title="Process map">
        <ProcessMapSection
          value={content.process_map}
          onChange={(v) => setKey("process_map", v)}
          refs={refs}
        />
      </Section>
      <Section title="Categories" badge={`${content.categories.length}`}>
        <CategoriesSection
          value={content.categories}
          onChange={(v) => setKey("categories", v)}
        />
      </Section>
      <Section
        title="Findings"
        badge={`${content.findings.pain_points.length}PP / ${content.findings.optimisations.length}OPT`}
      >
        <FindingsSection
          value={content.findings}
          onChange={(v) => setKey("findings", v)}
          refs={refs}
        />
      </Section>
      <Section
        title="Waste / hidden costs"
        badge={`${content.waste.opportunities.length}`}
      >
        <WasteSection
          value={content.waste}
          onChange={(v) => setKey("waste", v)}
          refs={refs}
        />
      </Section>
      <Section
        title="Blueprint"
        badge={`${content.blueprint.opportunities.length} opps`}
      >
        <BlueprintSection
          value={content.blueprint}
          onChange={(v) => setKey("blueprint", v)}
          refs={refs}
        />
      </Section>
      <Section title="Prototype CTA">
        <PrototypeSection
          value={content.prototype}
          onChange={(v) => setKey("prototype", v)}
        />
      </Section>
      <Section title="Comprehensive report">
        <ReportSection
          value={content.report}
          onChange={(v) => setKey("report", v)}
        />
      </Section>
      <Section title="Footer">
        <FooterSection
          value={content.footer}
          onChange={(v) => setKey("footer", v)}
        />
      </Section>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-8 py-3">
          <span className="text-[12px] text-muted">
            {refErrors.length > 0
              ? `${refErrors.length} issue(s) to fix`
              : "Ready to save"}
          </span>
          <div className="flex items-center gap-2">
            {meta.slug && SLUG_RE.test(meta.slug) && (
              <a
                href={`${FRONTEND}/audit/${meta.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border px-3 py-2 text-[13px] text-foreground hover:bg-black/5"
              >
                Open preview
              </a>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/audits")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {mode === "create" ? "Create audit" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
