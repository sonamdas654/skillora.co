import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ServiceRow from "./ServiceRow";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("pricing_services")
    .select("*")
    .order("display_order");

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Pricing Engine</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The base price, questions and options for every service on the requirement form — edit here,
        no code changes needed. Each service&apos;s detailed questions/add-ons/external costs are
        managed on its own page.
      </p>
      <div className="mt-6 space-y-3">
        {(services ?? []).map((s) => (
          <ServiceRow key={s.id} service={s} />
        ))}
      </div>
      <Link
        href="/admin/dashboard/pricing/costs"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
      >
        Internal cost &amp; profit engine →
      </Link>
    </div>
  );
}
