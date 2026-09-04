import { createClient } from "@/lib/supabase/server";
import PortfolioManager from "./PortfolioManager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Portfolio</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Real client projects you add here appear on the public portfolio page alongside the
        built-in concept demos. Add real work (with permission) and untick &quot;demo&quot; — it
        shows without the Concept badge.
      </p>
      <PortfolioManager items={items ?? []} />
    </div>
  );
}
