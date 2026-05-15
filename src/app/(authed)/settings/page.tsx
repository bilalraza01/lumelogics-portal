"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";

const ERROR_COPY: Record<string, string> = {
  invalid_current_password: "Your current password is incorrect.",
  missing_fields:           "Fill in every field.",
};

function describeError(message: string): string {
  if (ERROR_COPY[message]) return ERROR_COPY[message];
  if (message.startsWith("password ")) {
    // Field error from the API, e.g. "password is too short (minimum is 8 characters)"
    return `New password ${message.slice("password ".length)}.`;
  }
  return "Could not change the password. Try again.";
}

export default function SettingsPage() {
  const { admin, changePassword } = useAuth();
  const [current, setCurrent]   = useState("");
  const [next, setNext]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (next !== confirm) {
      setError("The new password and its confirmation don't match.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next === current) {
      setError("The new password must be different from the current one.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(current, next);
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(describeError(err instanceof Error ? err.message : "change_failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-xl">
        <header>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            Signed in as <span className="font-medium text-foreground">{admin?.email}</span>.
          </p>
        </header>

        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">
            Change password
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            You&apos;ll stay signed in on this device. New password is required for the next sign-in.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Current password" required>
              <Input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            <Field label="New password" required hint="At least 8 characters.">
              <Input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
            <Field label="Confirm new password" required>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800"
              >
                <CheckCircle2 size={15} className="shrink-0" />
                Password changed.
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Change password"
                )}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
