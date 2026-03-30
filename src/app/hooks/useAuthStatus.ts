"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export interface AuthStatus {
  loading: boolean;
  isLoggedIn: boolean;
  /** True if the user has a paid subscription (€39 one-off or any active subscription). */
  isPaid: boolean;
  /** True if the user has an active Architect subscription. */
  isArchitect: boolean;
  /** @deprecated Kept for backward-compat — always -1. Use isPaid / isArchitect. */
  trialDaysLeft: number;
  /** @deprecated Use isPaid for paid-feature access decisions. */
  hasAccess: boolean;
  userEmail: string | null;
}

export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>({
    loading: true,
    isLoggedIn: false,
    isPaid: false,
    isArchitect: false,
    trialDaysLeft: -1,
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
            isArchitect: false,
            trialDaysLeft: -1,
            hasAccess: false,
            userEmail: null,
          });
          return;
        }

        let isPaid = false;
        let isArchitect = false;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_paid, is_architect")
            .eq("id", user.id)
            .maybeSingle();
          isPaid = (profile as { is_paid?: boolean; is_architect?: boolean } | null)?.is_paid ?? false;
          isArchitect = (profile as { is_paid?: boolean; is_architect?: boolean } | null)?.is_architect ?? false;
        } catch {
          // profiles table not yet migrated — safe default
        }

        setStatus({
          loading: false,
          isLoggedIn: true,
          isPaid,
          isArchitect,
          trialDaysLeft: -1,
          hasAccess: isPaid,
          userEmail: user.email ?? null,
        });
      } catch {
        setStatus({
          loading: false,
          isLoggedIn: false,
          isPaid: false,
          isArchitect: false,
          trialDaysLeft: -1,
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
