"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuditForm } from "@/components/audit/AuditForm";

export default function NewAuditPage() {
  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/audits"
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to audits
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-foreground">
          New audit
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          Build a client audit deliverable. Every section is editable below.
        </p>
        <div className="mt-8">
          <AuditForm mode="create" />
        </div>
      </div>
    </div>
  );
}
