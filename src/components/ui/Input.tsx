import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

const fieldBase =
  "block w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] text-foreground placeholder:text-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-foreground">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-[12px] text-muted">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-[12px] text-red-600">{error}</span>
      )}
    </label>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      className={cn(fieldBase, "min-h-[80px] leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}
