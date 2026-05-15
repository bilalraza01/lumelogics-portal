"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/lib/auth";

const ERROR_COPY: Record<string, string> = {
  invalid_credentials: "Email or password is incorrect.",
  missing_credentials: "Enter your email and password.",
};

export default function LoginPage() {
  const router = useRouter();
  const { hydrated, token, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If a session already exists, skip the form.
  useEffect(() => {
    if (hydrated && token) router.replace("/lead-magnets");
  }, [hydrated, token, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/lead-magnets");
    } catch (err) {
      const code = err instanceof Error ? err.message : "login_failed";
      setError(ERROR_COPY[code] ?? "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo href="/login" />
        </div>
        <div className="rounded-xl border border-border bg-surface p-7 shadow-sm">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            Sign in
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Admin access to the Lumelogics dashboard.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
