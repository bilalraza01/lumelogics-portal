"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MagnetForm } from "@/components/layout/MagnetForm";

export default function NewMagnetPage() {
  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/lead-magnets"
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to lead magnets
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-foreground">
          New lead magnet
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          Once saved, this magnet is reachable at
          {" "}
          <code className="rounded bg-black/[0.05] px-1 py-0.5 text-[12px]">
            lumelogics.com/free/&lt;slug&gt;
          </code>
          .
        </p>

        <div className="mt-8">
          <MagnetForm mode="create" />
        </div>
      </div>
    </div>
  );
}
