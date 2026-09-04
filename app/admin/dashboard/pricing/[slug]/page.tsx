import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PricingConfigManager from "./PricingConfigManager";

export const dynamic = "force-dynamic";

export default async function AdminPricingServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase.from("pricing_services").select("*").eq("slug", slug).maybeSingle();
  if (!service) notFound();

  const { data: fields } = await supabase
    .from("pricing_fields")
    .select("*")
    .eq("service_id", service.id)
    .order("display_order");

  const fieldIds = (fields ?? []).map((f) => f.id);
  const { data: options } =
    fieldIds.length > 0
      ? await supabase.from("pricing_field_options").select("*").in("field_id", fieldIds).order("display_order")
      : { data: [] };

  const { data: externalCosts } = await supabase
    .from("pricing_external_costs")
    .select("*")
    .eq("service_id", service.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">{service.name} — questions &amp; pricing</h1>
      <p className="mt-1 text-sm text-ink-soft">
        These are the exact questions and per-option prices the requirement form uses for this
        service. Set a Skilloura/market price on an option to make it affect the live estimate —
        leave both at 0 to just capture the answer with no price impact.
      </p>
      <PricingConfigManager
        service={service}
        fields={fields ?? []}
        options={options ?? []}
        externalCosts={externalCosts ?? []}
      />
    </div>
  );
}
