"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Service {
  id: string;
  slug: string;
  name: string;
  base_market_price: number;
  base_skilloura_price: number;
  timeline: string | null;
  active: boolean;
}

export default function ServiceRow({ service }: { service: Service }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [skillouraPrice, setSkillouraPrice] = useState(service.base_skilloura_price);
  const [marketPrice, setMarketPrice] = useState(service.base_market_price);
  const [timeline, setTimeline] = useState(service.timeline ?? "");

  async function save() {
    setBusy(true);
    await supabase
      .from("pricing_services")
      .update({ base_skilloura_price: skillouraPrice, base_market_price: marketPrice, timeline })
      .eq("id", service.id);
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  async function toggleActive() {
    await supabase.from("pricing_services").update({ active: !service.active }).eq("id", service.id);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-ink">
            {service.name}{" "}
            {!service.active && (
              <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-bold text-ink-soft">HIDDEN</span>
            )}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            ₹{service.base_skilloura_price.toLocaleString("en-IN")} skilloura · ₹
            {service.base_market_price.toLocaleString("en-IN")} market · {service.timeline}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/dashboard/pricing/${service.slug}`}
            className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-accent hover:text-accent"
          >
            Manage questions &amp; add-ons
          </Link>
          <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-accent hover:text-accent">
            Edit base price
          </button>
          <button onClick={toggleActive} className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-accent hover:text-accent">
            {service.active ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 grid gap-2 rounded-xl bg-background p-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">Skilloura base price (₹)</label>
            <input type="number" value={skillouraPrice} onChange={(e) => setSkillouraPrice(+e.target.value)} className="w-full rounded-lg border border-line px-2.5 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">Market base price (₹)</label>
            <input type="number" value={marketPrice} onChange={(e) => setMarketPrice(+e.target.value)} className="w-full rounded-lg border border-line px-2.5 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">Timeline</label>
            <input value={timeline} onChange={(e) => setTimeline(e.target.value)} className="w-full rounded-lg border border-line px-2.5 py-1.5 text-sm" placeholder="e.g. 3–20 days" />
          </div>
          <div className="sm:col-span-3">
            <button disabled={busy} onClick={save} className="rounded-lg bg-ink px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
