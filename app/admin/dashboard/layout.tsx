import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/portal/SignOutButton";
import NotificationBell from "@/components/portal/NotificationBell";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/dashboard");

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).maybeSingle();
  if ((profile?.role ?? "client") !== "admin") redirect("/unauthorized");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="Skilloura" width={32} height={32} className="size-8 object-contain" />
            <span className="font-black tracking-tight text-ink">Skilloura</span>
            <span className="ml-2 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold text-white">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <SignOutButton />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4">
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
