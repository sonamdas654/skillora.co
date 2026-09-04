"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const inputCls = "w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none";
const FIELD_TYPES = ["text", "textarea", "select", "multiselect", "radio", "checkbox", "date", "number"];
const PRICING_TYPES = ["fixed", "per_item", "per_range", "percentage", "multiplier", "recurring", "one_time"];

function OptionRow({ option, onChanged }: { option: Row; onChanged: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [marketPrice, setMarketPrice] = useState(option.market_price);
  const [skillouraPrice, setSkillouraPrice] = useState(option.skilloura_price);
  const [pricingType, setPricingType] = useState(option.pricing_type);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await supabase
      .from("pricing_field_options")
      .update({ market_price: marketPrice, skilloura_price: skillouraPrice, pricing_type: pricingType })
      .eq("id", option.id);
    setBusy(false);
    onChanged();
  }
  async function remove() {
    if (!confirm(`Delete option "${option.option_label}"?`)) return;
    await supabase.from("pricing_field_options").delete().eq("id", option.id);
    onChanged();
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg bg-background p-2 sm:grid-cols-5 sm:items-center">
      <span className="text-xs font-semibold text-ink sm:col-span-1">{option.option_label}</span>
      <select value={pricingType} onChange={(e) => setPricingType(e.target.value)} className={inputCls}>
        {PRICING_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <input type="number" value={marketPrice} onChange={(e) => setMarketPrice(+e.target.value)} placeholder="Market ₹" className={inputCls} />
      <input type="number" value={skillouraPrice} onChange={(e) => setSkillouraPrice(+e.target.value)} placeholder="Skilloura ₹" className={inputCls} />
      <div className="flex gap-1.5">
        <button disabled={busy} onClick={save} className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-60">Save</button>
        <button onClick={remove} className="rounded-md border border-line px-2.5 py-1 text-[11px] font-semibold text-red-500">Del</button>
      </div>
    </div>
  );
}

function FieldCard({ field, options, onChanged }: { field: Row; options: Row[]; onChanged: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");

  async function toggleActive() {
    await supabase.from("pricing_fields").update({ active: !field.active }).eq("id", field.id);
    onChanged();
  }
  async function removeField() {
    if (!confirm(`Delete question "${field.label}" and all its options?`)) return;
    await supabase.from("pricing_fields").delete().eq("id", field.id);
    onChanged();
  }
  async function addOption(e: React.FormEvent) {
    e.preventDefault();
    if (!newOptionLabel.trim()) return;
    await supabase.from("pricing_field_options").insert({
      field_id: field.id,
      option_label: newOptionLabel,
      option_value: newOptionLabel,
      market_price: 0,
      skilloura_price: 0,
      pricing_type: "fixed",
      display_order: options.length,
    });
    setNewOptionLabel("");
    setShowAddOption(false);
    onChanged();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">
            {field.label}{" "}
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">{field.field_type}</span>
            {field.required && <span className="ml-1 text-[10px] font-bold text-red-500">required</span>}
            {!field.active && <span className="ml-1 rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-bold text-ink-soft">HIDDEN</span>}
          </p>
          <p className="text-[11px] text-ink-soft">key: {field.field_key}{field.conditional_rule ? ` · shown only if ${field.conditional_rule.field} in [${field.conditional_rule.in?.join(", ")}]` : ""}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={toggleActive} className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-ink hover:border-accent">
            {field.active ? "Hide" : "Show"}
          </button>
          <button onClick={removeField} className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-red-500">Delete</button>
        </div>
      </div>

      {options.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {options.map((o) => (
            <OptionRow key={o.id} option={o} onChanged={onChanged} />
          ))}
        </div>
      )}

      {["select", "multiselect", "radio"].includes(field.field_type) && (
        <div className="mt-3">
          {showAddOption ? (
            <form onSubmit={addOption} className="flex gap-2">
              <input value={newOptionLabel} onChange={(e) => setNewOptionLabel(e.target.value)} placeholder="New option label" className={inputCls} />
              <button className="rounded-md bg-accent px-3 py-1.5 text-[11px] font-semibold text-white">Add</button>
            </form>
          ) : (
            <button onClick={() => setShowAddOption(true)} className="text-[11px] font-semibold text-accent hover:underline">
              + Add option
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddFieldForm({ serviceId, nextOrder, onChanged }: { serviceId: string; nextOrder: number; onChanged: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");
  const [required, setRequired] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fieldKey = key.trim() || label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const { error } = await supabase.from("pricing_fields").insert({
      service_id: serviceId,
      field_key: fieldKey,
      label,
      field_type: type,
      required,
      display_order: nextOrder,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setKey("");
    setLabel("");
    setType("text");
    setRequired(false);
    setOpen(false);
    onChanged();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep">
        + Add question
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-4 space-y-2">
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <div className="grid gap-2 sm:grid-cols-4">
        <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Question label" className={inputCls} />
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Internal key (auto if blank)" className={inputCls} />
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-ink">
          <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> Required
        </label>
      </div>
      <div className="flex gap-2">
        <button className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white">Create question</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink-soft">Cancel</button>
      </div>
    </form>
  );
}

function ExternalCostRow({ cost, onChanged }: { cost: Row; onChanged: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [estimatedCost, setEstimatedCost] = useState(cost.estimated_cost);
  const [recurring, setRecurring] = useState(cost.recurring);
  const [discountAllowed, setDiscountAllowed] = useState(cost.discount_allowed);

  async function save() {
    await supabase
      .from("pricing_external_costs")
      .update({ estimated_cost: estimatedCost, recurring, discount_allowed: discountAllowed })
      .eq("id", cost.id);
    onChanged();
  }
  async function remove() {
    if (!confirm(`Delete "${cost.item_name}"?`)) return;
    await supabase.from("pricing_external_costs").delete().eq("id", cost.id);
    onChanged();
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg bg-background p-2 sm:grid-cols-6 sm:items-center">
      <span className="text-xs font-semibold text-ink sm:col-span-2">{cost.item_name} <span className="text-ink-soft">({cost.cost_type})</span></span>
      <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(+e.target.value)} className={inputCls} />
      <label className="flex items-center gap-1 text-[11px] text-ink"><input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} /> Recurring</label>
      <label className="flex items-center gap-1 text-[11px] text-ink"><input type="checkbox" checked={discountAllowed} onChange={(e) => setDiscountAllowed(e.target.checked)} /> Discountable</label>
      <div className="flex gap-1.5">
        <button onClick={save} className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">Save</button>
        <button onClick={remove} className="rounded-md border border-line px-2.5 py-1 text-[11px] font-semibold text-red-500">Del</button>
      </div>
    </div>
  );
}

function AddExternalCostForm({ serviceId, onChanged }: { serviceId: string; onChanged: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [costType, setCostType] = useState("other");
  const [cost, setCost] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("pricing_external_costs").insert({
      service_id: serviceId, item_name: name, cost_type: costType, estimated_cost: cost, recurring: false, discount_allowed: false,
    });
    setName(""); setCostType("other"); setCost(0); setOpen(false);
    onChanged();
  }

  if (!open) return <button onClick={() => setOpen(true)} className="text-xs font-semibold text-accent hover:underline">+ Add external cost</button>;
  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className={inputCls + " max-w-[200px]"} />
      <input value={costType} onChange={(e) => setCostType(e.target.value)} placeholder="Type (domain/hosting/api...)" className={inputCls + " max-w-[160px]"} />
      <input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} placeholder="₹" className={inputCls + " max-w-[100px]"} />
      <button className="rounded-md bg-accent px-3 py-1.5 text-[11px] font-semibold text-white">Add</button>
    </form>
  );
}

export default function PricingConfigManager({
  service,
  fields,
  options,
  externalCosts,
}: {
  service: Row;
  fields: Row[];
  options: Row[];
  externalCosts: Row[];
}) {
  const router = useRouter();
  const optionsByField: Record<string, Row[]> = {};
  for (const o of options) (optionsByField[o.field_id] ??= []).push(o);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-4">
      {fields.map((f) => (
        <FieldCard key={f.id} field={f} options={optionsByField[f.id] ?? []} onChanged={refresh} />
      ))}
      <AddFieldForm serviceId={service.id} nextOrder={fields.length} onChanged={refresh} />

      <div className="mt-8 rounded-2xl border border-line bg-white p-4">
        <p className="text-sm font-bold text-ink">External / third-party costs</p>
        <p className="mt-1 text-xs text-ink-soft">Domain, hosting, APIs, app-store fees — shown to the client separately, not Skilloura&apos;s fee.</p>
        <div className="mt-3 space-y-1.5">
          {externalCosts.map((c) => (
            <ExternalCostRow key={c.id} cost={c} onChanged={refresh} />
          ))}
        </div>
        <div className="mt-3">
          <AddExternalCostForm serviceId={service.id} onChanged={refresh} />
        </div>
      </div>
    </div>
  );
}
