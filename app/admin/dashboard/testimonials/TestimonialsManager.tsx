"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

interface TestimonialRow {
  id: string;
  client_name: string;
  client_business: string | null;
  rating: number;
  review: string;
  status: string;
}

export default function TestimonialsManager({ testimonials }: { testimonials: TestimonialRow[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const [copied, setCopied] = useState(false);

  async function generateLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLinkSaving(true);
    setLinkError("");
    setReviewLink("");
    setCopied(false);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/review-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: fd.get("clientName"),
        clientBusiness: fd.get("clientBusiness"),
      }),
    });
    setLinkSaving(false);
    if (res.ok) {
      const j = await res.json();
      setReviewLink(j.url);
    } else {
      const j = await res.json().catch(() => ({}));
      setLinkError(j.error || "Failed to generate link");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("testimonials").insert({
      client_name: fd.get("clientName"),
      client_business: fd.get("clientBusiness") || null,
      rating: Number(fd.get("rating")),
      review: fd.get("review"),
      status: "active",
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("testimonials").update({ status }).eq("id", id);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial permanently?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setShowLinkForm(!showLinkForm);
            setShowForm(false);
          }}
          className="rounded-full border border-accent/30 bg-white px-5 py-2.5 text-sm font-semibold text-accent hover:border-accent"
        >
          {showLinkForm ? "Cancel" : "Get review link"}
        </button>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setShowLinkForm(false);
          }}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep"
        >
          {showForm ? "Cancel" : "+ Add review"}
        </button>
      </div>

      {showLinkForm && (
        <form onSubmit={generateLink} className="mt-6 rounded-2xl border border-line bg-white p-6 space-y-4">
          <p className="text-sm text-ink-soft">
            Generate a <strong>personal review link</strong> for a delivered client and send it on
            WhatsApp. The client rates and writes the review themselves — it arrives as
            &quot;Pending&quot; for your approval. One review per link, valid 30 days.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Client name *</label>
              <input name="clientName" required className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Business</label>
              <input name="clientBusiness" placeholder="e.g. Spice Route, Pune" className={inputCls} />
            </div>
          </div>
          {linkError && <p className="text-sm font-medium text-red-500">{linkError}</p>}
          <button
            disabled={linkSaving}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {linkSaving ? "Generating..." : "Generate link"}
          </button>
          {reviewLink && (
            <div className="rounded-xl border border-mint/25 bg-mint/10 p-4">
              <p className="break-all text-xs font-medium text-ink">{reviewLink}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-full bg-mint px-4 py-1.5 text-xs font-semibold text-white"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Thank you for working with Skilloura! It would mean a lot if you could share a short review here: ${reviewLink}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-mint/40 px-4 py-1.5 text-xs font-semibold text-mint"
                >
                  Share on WhatsApp
                </a>
              </div>
            </div>
          )}
        </form>
      )}

      {showForm && (
        <form onSubmit={create} className="mt-6 rounded-2xl border border-line bg-white p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Client name *</label>
              <input name="clientName" required className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Business</label>
              <input name="clientBusiness" placeholder="e.g. Spice Route, Pune" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Rating *</label>
              <select name="rating" required className={inputCls} defaultValue="5">
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {"★".repeat(r)} ({r})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Review *</label>
            <textarea name="review" required rows={3} className={inputCls} />
          </div>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <button
            disabled={saving}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Adding..." : "Add review"}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {testimonials.length === 0 && (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-soft">
            No reviews yet. After delivering projects, ask happy clients for a short review and add
            it here.
          </p>
        )}
        {testimonials.map((t) => (
          <div key={t.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink">
                  {t.client_name}
                  {t.client_business && (
                    <span className="font-normal text-ink-soft"> · {t.client_business}</span>
                  )}{" "}
                  <span className="text-amber-500">{"★".repeat(t.rating)}</span>
                </p>
                <p className="mt-1 text-sm text-ink-soft">&quot;{t.review}&quot;</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={t.status}
                  onChange={(e) => setStatus(t.id, e.target.value)}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:border-accent focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active (public)</option>
                  <option value="hidden">Hidden</option>
                </select>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:border-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
