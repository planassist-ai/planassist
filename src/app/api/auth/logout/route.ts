import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/logout
 *
 * Server-side logout handler. Invalidates the Supabase session, clears all
 * auth cookies from the response, then redirects to the homepage.
 *
 * All logout buttons across the app point here via window.location.href so
 * the browser makes a real GET request — bypassing any client-side state issues.
 */
export async function GET(request: NextRequest) {
  const cookieStore = cookies();

  // Build the redirect response first so the Supabase client can write
  // cookie-clear headers directly onto it via the setAll callback.
  const response = NextResponse.redirect(new URL("/", request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Write any cookie changes (deletions included) onto the redirect response.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Sign out server-side — this invalidates the session in Supabase and
  // triggers the setAll callback above to clear the auth cookie.
  await supabase.auth.signOut();

  // Belt-and-braces: explicitly delete every sb-* cookie so nothing lingers
  // even if signOut's setAll callback didn't cover a split cookie chunk.
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.delete(cookie.name);
    }
  });

  return response;
}
