import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/portal/ProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("user_profiles").select("full_name, phone").eq("id", user.id).single();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-soft">Signed in as {user.email}.</p>
      <div className="mt-6 max-w-lg">
        <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} businessName="" cityCountry="" whatsapp="" hideBusinessFields />
      </div>
    </div>
  );
}
