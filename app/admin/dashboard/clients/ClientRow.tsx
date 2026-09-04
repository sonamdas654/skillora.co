"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export default function ClientRow({ client, clientProfile }: { client: Row; clientProfile: Row | null }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState(client.full_name || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [business, setBusiness] = useState(clientProfile?.business_name || "");
  const [city, setCity] = useState(clientProfile?.city_country || "");
  const [whatsapp, setWhatsapp] = useState(clientProfile?.whatsapp || "");
  const [status, setStatus] = useState(client.status || "active");

  async function save() {
    setBusy(true);
    setError("");
    const { error } = await supabase.rpc("admin_edit_client", {
      p_user_id: client.id,
      p_full_name: fullName,
      p_phone: phone,
      p_business_name: business,
      p_city_country: city,
      p_whatsapp: whatsapp,
      p_status: status,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-ink">{client.full_name || client.email}</p>
          <p className="mt-0.5 text-sm text-ink-soft">{client.email}</p>
          <p className="mt-1 text-xs text-ink-soft">
            {clientProfile?.business_name && `${clientProfile.business_name} · `}
            {clientProfile?.whatsapp || client.phone || "No phone"}
            {clientProfile?.city_country && ` · ${clientProfile.city_country}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">{client.status}</span>
          <button onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-ink-soft hover:text-accent hover:underline">
            Edit
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-2 rounded-xl bg-background p-3">
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="rounded-lg border border-line px-2.5 py-1.5 text-xs" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-lg border border-line px-2.5 py-1.5 text-xs" />
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp" className="rounded-lg border border-line px-2.5 py-1.5 text-xs" />
            <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name" className="rounded-lg border border-line px-2.5 py-1.5 text-xs" />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City / Country" className="rounded-lg border border-line px-2.5 py-1.5 text-xs" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-line px-2.5 py-1.5 text-xs">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} onClick={save} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
              {busy ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
