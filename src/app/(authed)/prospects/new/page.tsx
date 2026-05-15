"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProspectForm } from "@/components/layout/ProspectForm";

export default function NewProspectPage() {
  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/prospects"
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to prospects
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-foreground">
          New prospect
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          Manual entry. For bulk loading use the CSV import.
        </p>
        <div className="mt-8">
          <ProspectForm mode="create" />
        </div>
      </div>
    </div>
  );
}
