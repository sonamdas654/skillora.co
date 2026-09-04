import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  converted_from_request: "converted a lead into a project",
  status_changed: "changed project status",
  quote_published: "published a quote",
  quote_approved: "approved a quote",
  quote_rejected: "rejected a quote",
  payment_submitted: "submitted a payment",
  payment_verified: "verified a payment",
  payment_rejected: "rejected a payment",
};

export default async function AdminLogsPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("id, actor_id, entity_type, entity_id, action, meta, created_at, user_profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Activity logs</h1>
      <p className="mt-1 text-sm text-ink-soft">An audit trail of key actions across the business OS.</p>

      {logs && logs.length > 0 ? (
        <div className="mt-6 space-y-2.5">
          {logs.map((l: Record<string, any>) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
            const actor = Array.isArray(l.user_profiles) ? l.user_profiles[0] : l.user_profiles;
            return (
              <div key={l.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm">
                <p className="text-ink">
                  <span className="font-semibold">{actor?.full_name || actor?.email || "Someone"}</span>{" "}
                  {ACTION_LABEL[l.action] || l.action} <span className="text-ink-soft">({l.entity_type})</span>
                </p>
                <p className="whitespace-nowrap text-xs text-ink-soft">{new Date(l.created_at).toLocaleString("en-IN")}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">No activity yet.</div>
      )}
    </div>
  );
}
