import { createClient } from "@/lib/supabase/server";
import BlogManager from "./BlogManager";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Blog</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Draft posts are only visible here. Set status to &quot;Published&quot; to put them live at
        /blog.
      </p>
      <BlogManager posts={posts ?? []} />
    </div>
  );
}
