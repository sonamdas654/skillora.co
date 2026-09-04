import { createClient } from "@/lib/supabase/server";
import TestimonialsManager from "./TestimonialsManager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Testimonials</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Only add <strong>real reviews from real clients</strong> — fake reviews destroy trust and
        can get you flagged. Reviews marked &quot;active&quot; appear on the homepage.
      </p>
      <TestimonialsManager testimonials={testimonials ?? []} />
    </div>
  );
}
