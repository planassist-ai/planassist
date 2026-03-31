import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse, type NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code         = searchParams.get("code");
  const next         = searchParams.get("next") ?? "/dashboard";
  const isArchitect  = searchParams.get("type") === "architect";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user so we can upsert their profile.
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Use the service-role admin client to bypass RLS for profile creation.
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const now      = new Date().toISOString();
        const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // ignoreDuplicates: true — only create; never overwrite an existing profile.
        await adminClient.from("profiles").upsert(
          {
            id:                  user.id,
            email:               user.email,
            is_paid:             false,
            is_architect:        isArchitect,
            is_lead:             isArchitect,
            onboarding_complete: false,
            trial_start_date:    now,
            trial_end_date:      trialEnd,
            created_at:          now,
          },
          { onConflict: "id", ignoreDuplicates: true }
        );

        // Notify the team when an architect signs up via /for-architects.
        if (isArchitect) {
          await resend.emails.send({
            from:    "Granted <noreply@granted.ie>",
            to:      "hello@granted.ie",
            subject: `New architect lead — ${user.email}`,
            text:    `New architect lead\n\nEmail: ${user.email}\nSource: /for-architects page\nTime: ${now}\n\nFollow up to schedule their onboarding call.`,
          }).catch(() => {
            // Non-fatal — don't block the redirect if the notification fails.
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with an error hint.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
