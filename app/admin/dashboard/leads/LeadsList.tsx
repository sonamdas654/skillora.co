"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { REQUEST_STATUS_LABEL, statusPillClass } from "@/lib/portalLabels";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export default function LeadsList({ leads }: { leads: Row[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function convert(lead: Row) {
    if (!lead.client_id) {
      setError("This lead has no linked account yet — ask the client to sign up / sign in first (they'll be attached automatically by email).");
      return;
    }
    setBusyId(lead.id);
    setError("");
    const { data, error } = await supabase.rpc("convert_request_to_project", {
      p_request_id: lead.id,
      p_title: lead.service_type || lead.service_category,
    });
    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/admin/dashboard/projects/${data}`);
  }

  if (leads.length === 0) {
    return <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">No requests yet.</div>;
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
      {leads.map((r) => (
        <div key={r.id} className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-ink">{r.guest_name || "Guest"} — {r.service_category}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{r.service_type}</p>
              <p className="mt-1 text-xs text-ink-soft">
                {r.guest_email} {r.guest_phone && `· ${r.guest_phone}`} {r.budget_range && `· ${r.budget_range}`}
              </p>
              {r.description && <p className="mt-2 max-w-xl text-sm text-ink-soft">{r.description}</p>}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusPillClass(r.status)}`}>
              {REQUEST_STATUS_LABEL[r.status] ?? r.status}
            </span>
          </div>
          {!["converted", "closed"].includes(r.status) && (
            <button
              disabled={busyId === r.id}
              onClick={() => convert(r)}
              className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep disabled:opacity-60"
            >
              {busyId === r.id ? "Converting…" : "Convert to project"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
