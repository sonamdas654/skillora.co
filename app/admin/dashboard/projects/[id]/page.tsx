import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectWorkspace from "@/app/client/dashboard/projects/[id]/ProjectWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();

  const [{ data: quotes }, { data: payments }, { data: revisions }, { data: previews }, { data: files }, { data: messages }] =
    await Promise.all([
      supabase.from("quotes").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("revisions").select("*").eq("project_id", id).order("round_number", { ascending: false }),
      supabase.from("preview_links").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("files").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("messages").select("*").eq("project_id", id).order("created_at", { ascending: true }),
    ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ProjectWorkspace
      project={project}
      quotes={quotes ?? []}
      payments={payments ?? []}
      revisions={revisions ?? []}
      previews={previews ?? []}
      files={files ?? []}
      messages={messages ?? []}
      userId={user?.id ?? ""}
      role="admin"
    />
  );
}
