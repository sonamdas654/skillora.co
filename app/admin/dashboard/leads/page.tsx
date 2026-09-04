import { createClient } from "@/lib/supabase/server";
import LeadsList from "./LeadsList";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("project_requests")
    .select("id, client_id, guest_name, guest_email, guest_phone, service_category, service_type, description, budget_range, deadline, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Leads & project requests</h1>
      <p className="mt-1 text-sm text-ink-soft">Requests submitted through the website — convert the ones ready to start.</p>
      <div className="mt-6">
        <LeadsList leads={leads ?? []} />
      </div>
    </div>
  );
}
