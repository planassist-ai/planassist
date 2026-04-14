/**
 * Server-side helpers for checking auth and subscription tier in API routes.
 *
 * Tier rules:
 *  - FREE          — no login required
 *  - PAID          — is_paid = true  (€39 one-off OR any active subscription)
 *  - ARCHITECT     — is_architect = true (architect subscription only)
 *
 * Demo mode (NEXT_PUBLIC_IS_DEMO=true):
 *  - resolveUserTier() returns a fully-unlocked demo tier — no Supabase call needed.
 *  - All API routes that check tier.isPaid or tier.isArchitect will pass automatically.
 *
 * Implementation note:
 *  - We use the cookie-based server client (createServerClient) so the user's JWT is
 *    forwarded to Supabase for every query. This means RLS works correctly without
 *    requiring a service role key.
 *  - resolveUserTier() also returns the authenticated supabase client so API routes
 *    can reuse it for DB operations with the user's session already attached.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Build a cookie-based server Supabase client (carries the user's JWT via cookies).
function createAuthClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* read-only in Server Components */ }
        },
      },
    }
  );
}

export interface UserTier {
  userId: string;
  email: string;
  isPaid: boolean;
  isArchitect: boolean;
  /** Authenticated Supabase client — use this for all DB queries in API routes. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: SupabaseClient<any, "public", any>;
}

// Demo tier — fully unlocked, no database dependency.
// db is a no-op placeholder; demo mode should use in-memory data.
const DEMO_TIER_BASE = {
  userId: "demo-user-murphy-architecture",
  email: "demo@murphy-architecture.ie",
  isPaid: true,
  isArchitect: true,
};

/**
 * Resolves the authenticated user + their subscription tier from the request cookies.
 * Returns null if the user is not authenticated.
 * In demo mode, returns a fully-unlocked tier without any Supabase call.
 *
 * Also returns `db` — the authenticated Supabase client to use for all DB queries.
 * Because it carries the user's JWT, RLS policies work correctly without a service role key.
 */
export async function resolveUserTier(): Promise<UserTier | null> {
  // Demo mode: bypass all auth and return fully-unlocked tier.
  if (process.env.NEXT_PUBLIC_IS_DEMO === "true") {
    const db = createAuthClient();
    return { ...DEMO_TIER_BASE, db };
  }

  const db = createAuthClient();

  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  // Read profile using the same authenticated client — RLS allows users to
  // read their own row (profiles.id = auth.uid()).
  const { data: profile } = await db
    .from("profiles")
    .select("is_paid, is_architect")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    isPaid:      (profile as { is_paid?: boolean; is_architect?: boolean } | null)?.is_paid      ?? false,
    isArchitect: (profile as { is_paid?: boolean; is_architect?: boolean } | null)?.is_architect ?? false,
    db,
  };
}

/** Returns a 401 JSON response for unauthenticated requests. */
export function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

/** Returns a 403 JSON response for authenticated but un-paid requests. */
export function paymentRequired() {
  return NextResponse.json(
    { error: "A paid subscription is required to use this feature." },
    { status: 403 }
  );
}

/** Returns a 403 JSON response for non-architect requests on architect-only routes. */
export function architectOnly() {
  return NextResponse.json(
    { error: "An Architect subscription is required to use this feature." },
    { status: 403 }
  );
}
