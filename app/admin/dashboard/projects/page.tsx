import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STATUS_LABEL, statusPillClass } from "@/lib/portalLabels";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, service_category, status, progress, updated_at, user_profiles(full_name, email)")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Projects</h1>
      <p className="mt-1 text-sm text-ink-soft">The live delivery pipeline.</p>

      {projects && projects.length > 0 ? (
        <div className="mt-6 space-y-3">
          {projects.map((p: Record<string, any>) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
            const client = Array.isArray(p.user_profiles) ? p.user_profiles[0] : p.user_profiles;
            return (
              <Link
                key={p.id}
                href={`/admin/dashboard/projects/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 hover:border-accent"
              >
                <div className="min-w-0">
                  <p className="font-bold text-ink">{p.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {client?.full_name || client?.email} · {p.service_category}
                  </p>
                  <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusPillClass(p.status)}`}>
                  {PROJECT_STATUS_LABEL[p.status] ?? p.status}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          No projects yet — convert a lead from the Leads tab to start one.
        </div>
      )}
    </div>
  );
}
