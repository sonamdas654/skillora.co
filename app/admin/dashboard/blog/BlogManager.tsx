"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";
const monoCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 font-mono text-xs text-ink focus:border-accent focus:outline-none";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  date: string;
  read_minutes: number;
  category: string;
  content: string;
  key_takeaways: unknown;
  cost_table: unknown;
  faqs: unknown;
  service_cta_slug: string | null;
  service_cta_label: string | null;
  demo_slug: string | null;
  demo_label: string | null;
  related_slugs: unknown;
  sources: unknown;
  status: string;
}

const j = (v: unknown) => JSON.stringify(v ?? [], null, 2);

function emptyForm(): Partial<PostRow> {
  return {
    slug: "",
    title: "",
    meta_description: "",
    date: new Date().toISOString().slice(0, 10),
    read_minutes: 5,
    category: "",
    content: "",
    key_takeaways: [],
    cost_table: [],
    faqs: [],
    service_cta_slug: "",
    service_cta_label: "",
    demo_slug: "",
    demo_label: "",
    related_slugs: [],
    sources: [],
    status: "draft",
  };
}

export default function BlogManager({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [editing, setEditing] = useState<PostRow | Partial<PostRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openNew() {
    setEditing(emptyForm());
    setError("");
  }
  function openEdit(p: PostRow) {
    setEditing(p);
    setError("");
  }

  function parseJsonField(name: string, raw: string): unknown[] | null {
    try {
      const v = JSON.parse(raw || "[]");
      if (!Array.isArray(v)) throw new Error(`${name} must be a JSON array`);
      return v;
    } catch (e) {
      setError(`Invalid JSON in "${name}": ${e instanceof Error ? e.message : "parse error"}`);
      return null;
    }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    const keyTakeaways = parseJsonField("Key takeaways", String(fd.get("key_takeaways")));
    if (keyTakeaways === null) return;
    const costTable = parseJsonField("Cost table", String(fd.get("cost_table")));
    if (costTable === null) return;
    const faqs = parseJsonField("FAQs", String(fd.get("faqs")));
    if (faqs === null) return;
    const relatedSlugs = parseJsonField("Related slugs", String(fd.get("related_slugs")));
    if (relatedSlugs === null) return;
    const sources = parseJsonField("Sources", String(fd.get("sources")));
    if (sources === null) return;

    const payload = {
      slug: String(fd.get("slug") || "").trim(),
      title: String(fd.get("title") || "").trim(),
      meta_description: String(fd.get("meta_description") || "").trim(),
      date: String(fd.get("date") || ""),
      read_minutes: Number(fd.get("read_minutes")) || 5,
      category: String(fd.get("category") || "").trim(),
      content: String(fd.get("content") || ""),
      key_takeaways: keyTakeaways,
      cost_table: costTable,
      faqs,
      service_cta_slug: String(fd.get("service_cta_slug") || "") || null,
      service_cta_label: String(fd.get("service_cta_label") || "") || null,
      demo_slug: String(fd.get("demo_slug") || "") || null,
      demo_label: String(fd.get("demo_label") || "") || null,
      related_slugs: relatedSlugs,
      sources,
      status: String(fd.get("status") || "draft"),
    };

    setSaving(true);
    const { error } =
      editing && "id" in editing && editing.id
        ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
        : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    router.refresh();
  }

  if (editing) {
    const isNew = !("id" in editing && editing.id);
    return (
      <form onSubmit={save} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">{isNew ? "New post" : "Edit post"}</h2>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Title *</label>
            <input name="title" required defaultValue={editing.title} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Slug *</label>
            <input name="slug" required defaultValue={editing.slug} className={inputCls} placeholder="my-post-slug" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Category *</label>
            <input name="category" required defaultValue={editing.category} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Status</label>
            <select name="status" defaultValue={editing.status ?? "draft"} className={inputCls}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Date</label>
            <input type="date" name="date" defaultValue={editing.date} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Read minutes</label>
            <input type="number" name="read_minutes" min={1} defaultValue={editing.read_minutes ?? 5} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Meta description *</label>
          <textarea name="meta_description" required rows={2} defaultValue={editing.meta_description} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Content * — blank line between paragraphs, &quot;## &quot; for a heading, &quot;- &quot; per bullet
          </label>
          <textarea name="content" required rows={14} defaultValue={editing.content} className={inputCls + " font-mono text-xs"} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Service CTA slug</label>
            <input name="service_cta_slug" defaultValue={editing.service_cta_slug ?? ""} className={inputCls} placeholder="website-development" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Service CTA label</label>
            <input name="service_cta_label" defaultValue={editing.service_cta_label ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Demo slug/URL</label>
            <input name="demo_slug" defaultValue={editing.demo_slug ?? ""} className={inputCls} placeholder="/portfolio/restaurant-website-concept" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Demo label</label>
            <input name="demo_label" defaultValue={editing.demo_label ?? ""} className={inputCls} />
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Advanced (JSON arrays — leave as <code>[]</code> if unused)
        </p>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Key takeaways — <code>[&quot;point 1&quot;, &quot;point 2&quot;]</code>
          </label>
          <textarea name="key_takeaways" rows={3} defaultValue={j(editing.key_takeaways)} className={monoCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Cost table — <code>[{"{"}&quot;item&quot;:&quot;...&quot;,&quot;price&quot;:&quot;...&quot;{"}"}]</code>
          </label>
          <textarea name="cost_table" rows={3} defaultValue={j(editing.cost_table)} className={monoCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            FAQs — <code>[{"{"}&quot;q&quot;:&quot;...&quot;,&quot;a&quot;:&quot;...&quot;{"}"}]</code>
          </label>
          <textarea name="faqs" rows={4} defaultValue={j(editing.faqs)} className={monoCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Related post slugs — <code>[&quot;other-post-slug&quot;]</code>
          </label>
          <textarea name="related_slugs" rows={2} defaultValue={j(editing.related_slugs)} className={monoCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Sources — <code>[{"{"}&quot;label&quot;:&quot;...&quot;,&quot;url&quot;:&quot;...&quot;{"}"}]</code>
          </label>
          <textarea name="sources" rows={3} defaultValue={j(editing.sources)} className={monoCls} />
        </div>

        <div className="flex gap-2">
          <button disabled={saving} className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save post"}
          </button>
          <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-ink-soft">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="mt-4">
        <button onClick={openNew} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep">
          + New post
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {posts.length === 0 && (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-soft">
            No posts yet.
          </p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink">
                  {p.title}{" "}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      p.status === "published" ? "bg-mint/15 text-mint" : "bg-black/[0.06] text-ink-soft"
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  /blog/{p.slug} · {p.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(p)} className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-accent hover:text-accent">
                  Edit
                </button>
                <button onClick={() => remove(p.id)} className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:border-red-300">
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
