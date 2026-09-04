import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session on each request and enforces access control
// for the NEW Supabase routes only — the existing live portal (/client/*,
// /admin/* old routes) is untouched, since none of those paths are in the
// proxy matcher (see proxy.ts).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-anon.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const authRes = await supabase.auth.getUser();
    user = authRes.data.user;
  } catch {
    return response;
  }

  const path = request.nextUrl.pathname;
  const isClientDash = path.startsWith("/client/dashboard");
  const isAdminDash = path.startsWith("/admin/dashboard");
  const isLoginPage = path === "/login";

  // Guest tries a protected dashboard -> send to unified login.
  if ((isClientDash || isAdminDash) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Signed-in user: bounce away from /login, and role-gate /admin/dashboard.
  if (user && (isLoginPage || isAdminDash)) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = profile?.role ?? "client";

    if (isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin/dashboard" : "/client/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (isAdminDash && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
