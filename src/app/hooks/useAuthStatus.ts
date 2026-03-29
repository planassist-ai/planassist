"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export interface AuthStatus {
  loading: boolean;
  isLoggedIn: boolean;
  /** Whether the user has a paid Stripe subscription (used by webhook/success page only — not for feature gating). */
  isPaid: boolean;
  /** @deprecated Use isLoggedIn for access decisions. Any logged-in user has full access. */
  trialDaysLeft: number;
  /** True if the user has full access. Equivalent to isLoggedIn — any authenticated user gets everything. */
  hasAccess: boolean;
  userEmail: string | null;
}

export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>({
    loading: true,
    isLoggedIn: false,
    isPaid: false,
    trialDaysLeft: 0,
    hasAccess: false,
    userEmail: null,
  });

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus({
            loading: false,
            isLoggedIn: false,
            isPaid: false,
            trialDaysLeft: 0,
            hasAccess: false,
            userEmail: null,
          });
          return;
        }

        // Read is_paid from profiles (kept for Stripe audit trail — not used for feature gating).
        let isPaid = false;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_paid")
            .eq("id", user.id)
            .maybeSingle();
          isPaid = (profile as { is_paid?: boolean } | null)?.is_paid ?? false;
        } catch {
          // profiles table not yet migrated — fine, isPaid stays false
        }

        // Any authenticated user has full access regardless of is_paid or trial dates.
        setStatus({
          loading: false,
          isLoggedIn: true,
          isPaid,
          trialDaysLeft: -1,
          hasAccess: true,
          userEmail: user.email ?? null,
        });
      } catch {
        setStatus({
          loading: false,
          isLoggedIn: false,
          isPaid: false,
          trialDaysLeft: 0,
          hasAccess: false,
          userEmail: null,
        });
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => subscription.unsubscribe();
  }, []);

  return status;
}
