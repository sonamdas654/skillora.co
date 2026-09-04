"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/dashboard/leads", label: "Leads" },
  { href: "/admin/dashboard/clients", label: "Clients" },
  { href: "/admin/dashboard/projects", label: "Projects" },
  { href: "/admin/dashboard/pricing", label: "Pricing" },
  { href: "/admin/dashboard/portfolio", label: "Portfolio" },
  { href: "/admin/dashboard/testimonials", label: "Testimonials" },
  { href: "/admin/dashboard/blog", label: "Blog" },
  { href: "/admin/dashboard/logs", label: "Activity" },
  { href: "/admin/dashboard/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 pt-1">
      {TABS.map((t) => {
        const active = t.href === "/admin/dashboard" ? pathname === t.href : pathname?.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-ink text-white" : "text-ink-soft hover:bg-background"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
