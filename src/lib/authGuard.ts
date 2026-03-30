/**
 * Server-side helpers for checking auth and subscription tier in API routes.
 *
 * Tier rules:
 *  - FREE          — no login required
 *  - PAID          — is_paid = true  (€39 one-off OR any active subscription)
 *  - ARCHITECT     — is_architect = true (architect subscription only)
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface UserTier {
  userId: string;
  email: string;
  isPaid: boolean;
  isArchitect: boolean;
}

/**
 * Resolves the authenticated user + their subscription tier from the request cookies.
 * Returns null if the user is not authenticated.
 */
export async function resolveUserTier(): Promise<UserTier | null> {
  const cookieStore = cookies();

  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_paid, is_architect")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    isPaid: (profile as { is_paid?: boolean; is_architect?: boolean } | null)?.is_paid ?? false,
    isArchitect: (profile as { is_paid?: boolean; is_architect?: boolean } | null)?.is_architect ?? false,
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
