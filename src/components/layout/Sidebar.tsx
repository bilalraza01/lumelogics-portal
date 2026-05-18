"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Target,
  Users,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lume_sidebar_collapsed";

const NAV = [
  { href: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/assessments",  label: "Assessments",  icon: ClipboardCheck },
  { href: "/lead-magnets", label: "Lead Magnets", icon: FileText },
  { href: "/audits",       label: "Audits",       icon: ClipboardList },
  { href: "/leads",        label: "Leads",        icon: Users },
  { href: "/prospects",    label: "Prospects",    icon: Target },
  { href: "/campaigns",    label: "Campaigns",    icon: Megaphone },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Restore the user's last choice after mount (avoids an SSR mismatch).
  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore — non-persistent is fine
      }
      return next;
    });
  }

  const itemBase =
    "flex items-center rounded-md text-[14px] font-medium transition-colors";

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Header: logo + collapse toggle */}
      <div
        className={cn(
          "flex pt-5 pb-6",
          collapsed
            ? "flex-col items-center gap-3 px-2"
            : "items-center justify-between px-5",
        )}
      >
        <Logo href="/" compact={collapsed} />
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-black/5 hover:text-foreground"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            // `/` is a prefix of every other route — match it exactly. Other
            // entries match when the path equals or starts with their href.
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    itemBase,
                    "px-3 py-2",
                    collapsed ? "justify-center" : "gap-2",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-foreground hover:bg-black/5",
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-3 py-4">
        {admin && !collapsed && (
          <p
            className="px-3 pb-2 text-[12px] text-muted truncate"
            title={admin.email}
          >
            {admin.email}
          </p>
        )}
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            itemBase,
            "w-full px-3 py-2 text-[13px]",
            collapsed ? "justify-center" : "gap-2",
            pathname === "/settings" || pathname.startsWith("/settings/")
              ? "bg-brand-50 text-brand-700"
              : "text-foreground hover:bg-black/5",
          )}
        >
          <Settings size={15} className="shrink-0" />
          {!collapsed && "Settings"}
        </Link>
        <button
          onClick={logout}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            itemBase,
            "mt-1 w-full px-3 py-2 text-[13px] text-foreground hover:bg-black/5",
            collapsed ? "justify-center" : "gap-2",
          )}
        >
          <LogOut size={15} className="shrink-0" />
          {!collapsed && "Log out"}
        </button>
      </div>
    </aside>
  );
}
