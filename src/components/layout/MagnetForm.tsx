"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import {
  leadMagnetsApi,
  UPLOAD_TYPES,
  type AdminLeadMagnet,
  type MagnetFormPayload,
  type ResourceType,
} from "@/lib/api/lead-magnets";
import { useAuth } from "@/lib/auth";

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "file", label: "Other file" },
  { value: "google_doc", label: "Google Doc / Sheet" },
  { value: "external_url", label: "External link" },
];

const ACCEPT_BY_TYPE: Record<ResourceType, string> = {
  pdf: "application/pdf,.pdf",
  file: ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.rtf,.zip,.png,.jpg,.jpeg,.gif,.webp",
  google_doc: "",
  external_url: "",
};

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

interface Props {
  mode: "create" | "edit";
  magnet?: AdminLeadMagnet;
}

export function MagnetForm({ mode, magnet }: Props) {
  const router = useRouter();
  const { apiFetch } = useAuth();

  const [slug, setSlug] = useState(magnet?.slug ?? "");
  const [title, setTitle] = useState(magnet?.title ?? "");
  const [description, setDescription] = useState(magnet?.description ?? "");
  const [resourceType, setResourceType] = useState<ResourceType>(
    magnet?.resource_type ?? "pdf",
  );
  const [resourceUrl, setResourceUrl] = useState(magnet?.resource_url ?? "");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  // The filename already stored on this magnet (edit mode), if any.
  const existingFileName = magnet?.resource_file_name ?? null;
  const [emailSubject, setEmailSubject] = useState(magnet?.email_subject ?? "");
  const [emailIntro, setEmailIntro] = useState(magnet?.email_intro ?? "");
  const [vslVideoUrl, setVslVideoUrl] = useState(magnet?.vsl_video_url ?? "");
  const [vslHeadline, setVslHeadline] = useState(magnet?.vsl_headline ?? "");
  const [vslBody, setVslBody] = useState(magnet?.vsl_body ?? "");
  const [calendlyUrl, setCalendlyUrl] = useState(magnet?.calendly_url ?? "");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [genericError, setGenericError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGenericError(null);

    if (!SLUG_RE.test(slug)) {
      setErrors({ slug: ["must be lowercase, alphanumeric + hyphens"] });
      return;
    }

    const isUpload = UPLOAD_TYPES.includes(resourceType);

    if (isUpload) {
      // A file is required unless one is already stored (edit mode, unchanged).
      if (!resourceFile && !existingFileName) {
        setErrors({ resource_file: ["please choose a file to upload"] });
        return;
      }
    } else if (!resourceUrl.trim()) {
      setErrors({ resource_url: ["is required for this type"] });
      return;
    }

    const payload: MagnetFormPayload = {
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      resource_type: resourceType,
      // Only send the field relevant to the chosen type.
      resource_url: isUpload ? undefined : resourceUrl.trim(),
      resource_file: isUpload && resourceFile ? resourceFile : undefined,
      email_subject: emailSubject.trim(),
      email_intro: emailIntro.trim() || undefined,
      vsl_video_url: vslVideoUrl.trim() || undefined,
      vsl_headline: vslHeadline.trim() || undefined,
      vsl_body: vslBody.trim() || undefined,
      calendly_url: calendlyUrl.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        await leadMagnetsApi.create(apiFetch, payload);
      } else if (magnet) {
        await leadMagnetsApi.update(apiFetch, magnet.id, payload);
      }
      router.push("/lead-magnets");
      router.refresh();
    } catch (err) {
      const e = err as Error & { errors?: Record<string, string[]> };
      if (e.errors) setErrors(e.errors);
      else setGenericError("Could not save. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(key: string): string | null {
    return errors[key]?.[0] ?? null;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {genericError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
        >
          {genericError}
        </div>
      )}

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
          Basics
        </h2>
        <div className="mt-5 space-y-5">
          <Field label="Slug" required error={fieldError("slug")} hint="URL-safe identifier — lowercase, hyphens.">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="ai-readiness-playbook"
              required
              disabled={mode === "edit"}
            />
          </Field>
          <Field label="Title" required error={fieldError("title")}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label="Description" hint="Shown on the landing page below the title.">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
          Resource
        </h2>
        <div className="mt-5 space-y-5">
          <Field label="Type" required error={fieldError("resource_type")}>
            <Select
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value as ResourceType);
                setErrors({});
              }}
            >
              {RESOURCE_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>

          {UPLOAD_TYPES.includes(resourceType) ? (
            <Field
              label={resourceType === "pdf" ? "PDF file" : "File"}
              required={!existingFileName}
              error={fieldError("resource_file")}
              hint={
                resourceType === "pdf"
                  ? "Uploaded to the server. Leads get an immediate download."
                  : "Any document/asset. Leads get an immediate download."
              }
            >
              <label className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-border bg-background px-4 py-5 text-sm text-muted hover:border-brand-300 hover:text-brand-700">
                <span className="flex items-center gap-2">
                  <FileUp size={18} />
                  {resourceFile
                    ? resourceFile.name
                    : existingFileName
                      ? `Current: ${existingFileName}`
                      : "Choose a file…"}
                </span>
                <span className="text-[12px] text-muted">
                  {resourceFile
                    ? `${(resourceFile.size / 1024).toFixed(0)} KB`
                    : existingFileName
                      ? "Replace"
                      : "Required"}
                </span>
                <input
                  type="file"
                  accept={ACCEPT_BY_TYPE[resourceType]}
                  className="hidden"
                  onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {existingFileName && !resourceFile && (
                <span className="mt-1 block text-[12px] text-muted">
                  Leave as-is to keep the current file.
                </span>
              )}
            </Field>
          ) : (
            <Field
              label="Resource URL"
              required
              error={fieldError("resource_url")}
              hint={
                resourceType === "google_doc"
                  ? "Google Docs/Sheets share link. Opens in a new tab for the lead."
                  : "Any external URL. Opens in a new tab for the lead."
              }
            >
              <Input
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://docs.google.com/document/d/…"
                required
              />
            </Field>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
          Verification email
        </h2>
        <div className="mt-5 space-y-5">
          <Field label="Subject" required error={fieldError("email_subject")}>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
            />
          </Field>
          <Field label="Intro copy" hint="Shown above the magic-link button in the email body.">
            <Textarea
              value={emailIntro}
              onChange={(e) => setEmailIntro(e.target.value)}
              rows={4}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
          Landing page VSL
        </h2>
        <p className="mt-1 text-[12px] text-muted">Optional. Video + copy shown beneath the download button.</p>
        <div className="mt-5 space-y-5">
          <Field label="Video URL" hint="YouTube, Vimeo, or any URL — we auto-detect embed shape.">
            <Input
              value={vslVideoUrl}
              onChange={(e) => setVslVideoUrl(e.target.value)}
              placeholder="https://youtu.be/…"
            />
          </Field>
          <Field label="Headline">
            <Input value={vslHeadline} onChange={(e) => setVslHeadline(e.target.value)} />
          </Field>
          <Field label="Body">
            <Textarea value={vslBody} onChange={(e) => setVslBody(e.target.value)} rows={4} />
          </Field>
          <Field
            label="Calendly URL"
            hint="Leave blank to use the default (bilal-lumelogics/30min)."
          >
            <Input
              value={calendlyUrl}
              onChange={(e) => setCalendlyUrl(e.target.value)}
              placeholder="https://calendly.com/your-handle/30min"
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <ButtonLink href="/lead-magnets" variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </>
          ) : mode === "create" ? (
            "Create magnet"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
