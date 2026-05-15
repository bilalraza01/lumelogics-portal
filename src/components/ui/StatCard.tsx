import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "emerald" | "amber" | "red" | "brand";

const TONES: Record<Tone, { iconBg: string; iconColor: string }> = {
  default: { iconBg: "bg-black/[0.04]",  iconColor: "text-foreground" },
  brand:   { iconBg: "bg-brand-50",      iconColor: "text-brand-700" },
  emerald: { iconBg: "bg-emerald-50",    iconColor: "text-emerald-700" },
  amber:   { iconBg: "bg-amber-50",      iconColor: "text-amber-700" },
  red:     { iconBg: "bg-red-50",        iconColor: "text-red-700" },
};

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  href?: string;
  icon: LucideIcon;
  tone?: Tone;
}

export function StatCard({ label, value, delta, href, icon: Icon, tone = "default" }: Props) {
  const t = TONES[tone];

  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
          {label}
        </span>
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${t.iconBg} ${t.iconColor}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-[32px] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </p>
      {delta && <p className="mt-1.5 text-[12px] text-muted">{delta}</p>}
    </>
  );

  const className =
    "block rounded-xl border border-border bg-surface p-5 transition-colors" +
    (href ? " hover:border-brand-200 hover:bg-brand-50/40" : "");

  if (href) return <Link href={href} className={className}>{body}</Link>;
  return <div className={className}>{body}</div>;
}
