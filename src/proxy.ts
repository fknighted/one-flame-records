import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Inline service client — avoids importing next/headers in Edge Runtime
function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function roleHome(role: string | undefined): string {
  if (role === "admin")      return "/admin";
  if (role === "bartender")  return "/bar";
  if (role === "artist")     return "/portal";
  if (role === "gamer")      return "/gamer";
  // No profiles row or unrecognised role — send to login to break any redirect loop
  return "/login";
}

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute  = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");
  const isBarRoute    = pathname.startsWith("/bar");
  // Use exact match + prefix-with-slash to avoid matching /gamer-signup (public page)
  const isGamerRoute  = pathname === "/gamer" || pathname.startsWith("/gamer/");

  if (!isAdminRoute && !isPortalRoute && !isBarRoute && !isGamerRoute) {
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await serviceClient()
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role as string | undefined;

  function redirect(path: string) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute  && role !== "admin")                              return redirect(roleHome(role));
  if (isPortalRoute && role !== "artist")                             return redirect(roleHome(role));
  if (isBarRoute    && role !== "admin" && role !== "bartender")      return redirect(roleHome(role));
  if (isGamerRoute  && role !== "gamer" && role !== "admin")          return redirect(roleHome(role));

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
