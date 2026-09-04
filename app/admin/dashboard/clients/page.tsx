import { createClient } from "@/lib/supabase/server";
import ClientRow from "./ClientRow";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, phone, status, created_at, client_profiles(business_name, city_country, whatsapp)")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Clients</h1>
      <p className="mt-1 text-sm text-ink-soft">Everyone with a Skilloura client account.</p>

      {clients && clients.length > 0 ? (
        <div className="mt-6 space-y-3">
          {clients.map((c: Record<string, any>) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
            const cp = Array.isArray(c.client_profiles) ? c.client_profiles[0] : c.client_profiles;
            return <ClientRow key={c.id} client={c} clientProfile={cp} />;
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          No client accounts yet — they appear here once someone signs up.
        </div>
      )}
    </div>
  );
}
