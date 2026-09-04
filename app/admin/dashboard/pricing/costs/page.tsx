import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CostEngineManager from "./CostEngineManager";

export const dynamic = "force-dynamic";

export default async function AdminCostEnginePage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("pricing_services").select("*").order("display_order");
  const { data: costItems } = await supabase.from("pricing_cost_items").select("*");

  return (
    <div>
      <Link href="/admin/dashboard/pricing" className="text-xs font-semibold text-accent hover:underline">
        ← Back to pricing engine
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-ink">Internal cost &amp; profit engine</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        Private to you — never shown to clients or exposed by any public page. Add your real costs
        (developer/designer/QA hours, hosting, maintenance) per service to see an accurate profit
        picture. GST and a typical payment-gateway fee are pre-filled as real, public reference rates
        — everything else starts empty on purpose, since only you know your actual costs.
      </p>
      <CostEngineManager services={services ?? []} costItems={costItems ?? []} />
    </div>
  );
}
