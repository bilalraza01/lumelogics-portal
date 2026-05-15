"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import {
  prospectsApi,
  PROSPECT_STATUSES,
  type Prospect,
  type ProspectFormPayload,
  type ProspectStatus,
} from "@/lib/api/prospects";
import { useAuth } from "@/lib/auth";

const STATUS_LABELS: Record<ProspectStatus, string> = {
  not_contacted: "Not contacted",
  sent:          "Sent",
  viewed:        "Viewed",
  replied:       "Replied",
  call_booked:   "Call booked",
  won:           "Won",
  lost:          "Lost",
};

interface Props {
  mode: "create" | "edit";
  prospect?: Prospect;
}

export function ProspectForm({ mode, prospect }: Props) {
  const router = useRouter();
  const { apiFetch } = useAuth();

  const [email, setEmail]             = useState(prospect?.email ?? "");
  const [firstName, setFirstName]     = useState(prospect?.first_name ?? "");
  const [lastName, setLastName]       = useState(prospect?.last_name ?? "");
  const [companyName, setCompanyName] = useState(prospect?.company_name ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(prospect?.linkedin_url ?? "");
  const [website, setWebsite]         = useState(prospect?.website ?? "");
  const [notes, setNotes]             = useState(prospect?.notes ?? "");
  const [status, setStatus]           = useState<ProspectStatus>(prospect?.status ?? "not_contacted");

  const [errors, setErrors]               = useState<Record<string, string[]>>({});
  const [genericError, setGenericError]   = useState<string | null>(null);
  const [submitting, setSubmitting]       = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGenericError(null);

    const payload: ProspectFormPayload = {
      email: email.trim(),
      first_name:   firstName.trim() || undefined,
      last_name:    lastName.trim() || undefined,
      company_name: companyName.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      website:      website.trim() || undefined,
      notes:        notes.trim() || undefined,
      status,
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        const created = await prospectsApi.create(apiFetch, payload);
        router.push(`/prospects/${created.id}`);
      } else if (prospect) {
        await prospectsApi.update(apiFetch, prospect.id, payload);
        router.push(`/prospects/${prospect.id}`);
      }
      router.refresh();
    } catch (err) {
      const e = err as Error & { errors?: Record<string, string[]> };
      if (e.errors) setErrors(e.errors);
      else setGenericError("Could not save prospect.");
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(key: string): string | null {
    return errors[key]?.[0] ?? null;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {genericError && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {genericError}
        </div>
      )}

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Identity</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Email" required error={fieldError("email")}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as ProspectStatus)}>
              {PROSPECT_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </Field>
          <Field label="First name" error={fieldError("first_name")}>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Last name" error={fieldError("last_name")}>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
          <Field label="Company name" error={fieldError("company_name")}>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </Field>
          <Field label="LinkedIn URL" error={fieldError("linkedin_url")}>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://www.linkedin.com/in/…" />
          </Field>
          <Field label="Website">
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">Notes</h2>
        <div className="mt-5">
          <Field label="Internal notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <ButtonLink href={mode === "edit" && prospect ? `/prospects/${prospect.id}` : "/prospects"} variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={submitting}>
          {submitting ? <><Loader2 size={16} className="animate-spin" />Saving…</> : (mode === "create" ? "Create prospect" : "Save changes")}
        </Button>
      </div>
    </form>
  );
}
