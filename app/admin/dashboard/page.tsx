import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STATUS_LABEL, statusPillClass } from "@/lib/portalLabels";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: leadCount }, { count: clientCount }, { count: projectCount }, { count: pendingPayments }, { data: recentLeads }, { data: recentProjects }] =
    await Promise.all([
      supabase.from("project_requests").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
      supabase.from("user_profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("projects").select("id", { count: "exact", head: true }).neq("status", "closed"),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "submitted"),
      supabase.from("project_requests").select("id, guest_name, service_category, status, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("projects").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    ]);

  const tiles = [
    ["New leads", leadCount ?? 0, "/admin/dashboard/leads"],
    ["Active clients", clientCount ?? 0, "/admin/dashboard/clients"],
    ["Active projects", projectCount ?? 0, "/admin/dashboard/projects"],
    ["Payments to verify", pendingPayments ?? 0, "/admin/dashboard/projects"],
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Business OS — Overview</h1>
      <p className="mt-1 text-sm text-ink-soft">A live snapshot of leads, clients, and delivery.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([title, value, href]) => (
          <Link key={title} href={href} className="rounded-2xl border border-line bg-white p-6 hover:border-accent">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{title}</p>
            <p className="mt-2 text-3xl font-black text-ink">{value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Recent leads</h2>
            <Link href="/admin/dashboard/leads" className="text-sm font-semibold text-accent hover:underline">View all</Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {recentLeads && recentLeads.length > 0 ? (
              recentLeads.map((r) => (
                <div key={r.id} className="rounded-xl border border-line bg-white p-4 text-sm">
                  <p className="font-bold text-ink">{r.guest_name || "Guest"}</p>
                  <p className="text-ink-soft">{r.service_category}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink-soft">No leads yet.</div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Recent project activity</h2>
            <Link href="/admin/dashboard/projects" className="text-sm font-semibold text-accent hover:underline">View all</Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.map((p) => (
                <Link key={p.id} href={`/admin/dashboard/projects/${p.id}`} className="flex items-center justify-between rounded-xl border border-line bg-white p-4 text-sm hover:border-accent">
                  <p className="font-bold text-ink">{p.title}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusPillClass(p.status)}`}>{PROJECT_STATUS_LABEL[p.status] ?? p.status}</span>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink-soft">No projects yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
