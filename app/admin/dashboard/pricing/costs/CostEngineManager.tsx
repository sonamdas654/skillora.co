"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { computeCostSummary, type CostItem } from "@/lib/pricingEngine";

interface Service {
  id: string;
  name: string;
  base_skilloura_price: number;
  base_market_price: number;
}

const inputCls = "w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none";
const COST_TYPES: CostItem["cost_type"][] = ["labor", "overhead", "tax", "fee", "one_time", "recurring"];

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function CostItemRow({ item, onChanged }: { item: CostItem; onChanged: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [unitCost, setUnitCost] = useState(item.unit_cost);
  const [units, setUnits] = useState(item.estimated_units);
  const [type, setType] = useState(item.cost_type);

  async function save() {
    await supabase.from("pricing_cost_items").update({ unit_cost: unitCost, estimated_units: units, cost_type: type }).eq("id", item.id);
    onChanged();
  }
  async function remove() {
    if (!confirm(`Delete "${item.cost_item}"?`)) return;
    await supabase.from("pricing_cost_items").delete().eq("id", item.id);
    onChanged();
  }
  const isPct = type === "tax" || type === "fee";

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg bg-background p-2 sm:grid-cols-6 sm:items-center">
      <span className="text-xs font-semibold text-ink sm:col-span-1">{item.cost_item}</span>
      <select value={type} onChange={(e) => setType(e.target.value as CostItem["cost_type"])} className={inputCls}>
        {COST_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <input type="number" value={unitCost} onChange={(e) => setUnitCost(+e.target.value)} placeholder={isPct ? "% rate" : "₹ per unit"} className={inputCls} />
      <input type="number" value={units} onChange={(e) => setUnits(+e.target.value)} placeholder={isPct ? "×" : "units/hours"} className={inputCls} />
      <span className="text-[11px] text-ink-soft sm:col-span-1">
        {isPct ? `${unitCost}% of price` : `${inr(unitCost)} × ${units}`}
      </span>
      <div className="flex gap-1.5">
        <button onClick={save} className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">Save</button>
        <button onClick={remove} className="rounded-md border border-line px-2.5 py-1 text-[11px] font-semibold text-red-500">Del</button>
      </div>
    </div>
  );
}

function AddCostItemForm({ serviceId, onChanged }: { serviceId: string; onChanged: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CostItem["cost_type"]>("labor");
  const [unitCost, setUnitCost] = useState(0);
  const [units, setUnits] = useState(1);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("pricing_cost_items").insert({
      service_id: serviceId, cost_item: name, cost_type: type, unit_cost: unitCost, estimated_units: units,
    });
    setName(""); setType("labor"); setUnitCost(0); setUnits(1); setOpen(false);
    onChanged();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-semibold text-accent hover:underline">
        + Add real cost item (e.g. Developer hours, Hosting, Maintenance)
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Developer hours" className={inputCls + " max-w-[180px]"} />
      <select value={type} onChange={(e) => setType(e.target.value as CostItem["cost_type"])} className={inputCls + " max-w-[110px]"}>
        {COST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <input type="number" value={unitCost} onChange={(e) => setUnitCost(+e.target.value)} placeholder="₹/hr or %" className={inputCls + " max-w-[100px]"} />
      <input type="number" value={units} onChange={(e) => setUnits(+e.target.value)} placeholder="hours/units" className={inputCls + " max-w-[100px]"} />
      <button className="rounded-md bg-accent px-3 py-1.5 text-[11px] font-semibold text-white">Add</button>
      <button type="button" onClick={() => setOpen(false)} className="text-[11px] font-semibold text-ink-soft">Cancel</button>
    </form>
  );
}

function ServiceCostBlock({ service, items, onChanged }: { service: Service; items: CostItem[]; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const summary = computeCostSummary(service, items);

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-center justify-between gap-3 text-left">
        <span className="font-bold text-ink">{service.name}</span>
        <span className="flex flex-wrap gap-3 text-xs">
          <span className="text-ink-soft">Price: <b className="text-ink">{inr(service.base_skilloura_price)}</b></span>
          <span className="text-ink-soft">Cost: <b className="text-ink">{inr(summary.actualCost)}</b></span>
          <span className={summary.grossProfit >= 0 ? "text-mint" : "text-red-500"}>
            Profit: <b>{inr(summary.grossProfit)}</b> ({summary.profitMarginPct}%)
          </span>
        </span>
      </button>

      {!summary.hasLaborCosts && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-ink">
          No labour/hosting/maintenance cost added yet — the profit above only accounts for GST +
          gateway fee, so it overstates your real margin. Add your real hours &amp; rates below.
        </p>
      )}

      {open && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-background p-3 sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-ink-soft">Market price</p>
              <p className="text-sm font-bold text-ink">{inr(service.base_market_price)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-ink-soft">Discount given</p>
              <p className="text-sm font-bold text-ink">{inr(summary.discountGiven)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-ink-soft">Break-even price</p>
              <p className="text-sm font-bold text-ink">{inr(summary.breakEvenPrice)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-ink-soft">Margin</p>
              <p className={`text-sm font-bold ${summary.profitMarginPct >= 0 ? "text-mint" : "text-red-500"}`}>{summary.profitMarginPct}%</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {items.map((it) => (
              <CostItemRow key={it.id} item={it} onChanged={onChanged} />
            ))}
          </div>
          <AddCostItemForm serviceId={service.id} onChanged={onChanged} />
        </div>
      )}
    </div>
  );
}

export default function CostEngineManager({ services, costItems }: { services: Service[]; costItems: CostItem[] }) {
  const router = useRouter();
  const itemsByService: Record<string, CostItem[]> = {};
  for (const it of costItems) (itemsByService[it.service_id] ??= []).push(it);

  return (
    <div className="mt-6 space-y-3">
      {services.map((s) => (
        <ServiceCostBlock key={s.id} service={s} items={itemsByService[s.id] ?? []} onChanged={() => router.refresh()} />
      ))}
    </div>
  );
}
