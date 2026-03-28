import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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
        const trialEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

        // ignoreDuplicates: true — only create; never overwrite an existing profile.
        await adminClient.from("profiles").upsert(
          {
            id:               user.id,
            email:            user.email,
            is_paid:          false,
            is_architect:     false,
            trial_start_date: now,
            trial_end_date:   trialEnd,
            created_at:       now,
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with an error hint.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
