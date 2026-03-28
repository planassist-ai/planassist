"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export interface AuthStatus {
  loading: boolean;
  isLoggedIn: boolean;
  isPaid: boolean;
  /** Days left in 60-day trial. 0 = expired. -1 = not applicable (isPaid). */
  trialDaysLeft: number;
  /** True if user has full access: either paid or within the 60-day trial. */
  hasAccess: boolean;
  userEmail: string | null;
}

const TRIAL_DAYS = 60;

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

        // Trial window is calculated from Supabase auth user created_at.
        // No extra DB column needed for trial tracking.
        const createdAt = new Date(user.created_at);
        const daysPassed = Math.floor(
          (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const trialDaysLeft = Math.max(0, TRIAL_DAYS - daysPassed);

        // Check is_paid from the practices table.
        // Gracefully handles the case where the column doesn't exist yet
        // (DB migration not yet run) — falls back to false.
        let isPaid = false;
        try {
          const { data: practice } = await supabase
            .from("practices")
            .select("is_paid")
            .eq("architect_email", user.email)
            .maybeSingle();
          isPaid = (practice as { is_paid?: boolean } | null)?.is_paid ?? false;
        } catch {
          // is_paid column not yet added — treat as not paid.
        }

        const hasAccess = isPaid || trialDaysLeft > 0;

        setStatus({
          loading: false,
          isLoggedIn: true,
          isPaid,
          trialDaysLeft: isPaid ? -1 : trialDaysLeft,
          hasAccess,
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
