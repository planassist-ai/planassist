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

        let isPaid = false;
        let trialDaysLeft = 0;

        // Read is_paid and trial dates from the profiles table (primary source).
        // Fall back gracefully if the table or row doesn't exist yet.
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_paid, trial_end_date")
            .eq("id", user.id)
            .maybeSingle();

          isPaid = (profile as { is_paid?: boolean } | null)?.is_paid ?? false;

          const trialEnd = (profile as { trial_end_date?: string } | null)?.trial_end_date;
          if (trialEnd) {
            const msLeft = new Date(trialEnd).getTime() - Date.now();
            trialDaysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
          } else {
            // Profile row not yet created — calculate from auth user created_at.
            const daysPassed = Math.floor(
              (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            trialDaysLeft = Math.max(0, TRIAL_DAYS - daysPassed);
          }
        } catch {
          // profiles table not yet migrated — fall back to auth user created_at.
          const daysPassed = Math.floor(
            (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          trialDaysLeft = Math.max(0, TRIAL_DAYS - daysPassed);
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
