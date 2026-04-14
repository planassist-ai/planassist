import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserTier, unauthorized, architectOnly } from "@/lib/authGuard";

// Use service role key to bypass RLS — auth verified via resolveUserTier()
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// PATCH /api/update-profile — update architect profile fields
export async function PATCH(request: NextRequest) {
  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isArchitect) return architectOnly();

  try {
    const body = await request.json();
    const {
      full_name,
      practice_name,
      county,
      num_architects,
      specialisms,
      counties_covered,
      email_alerts,
    } = body;

    // Build update payload — only include provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileUpdate: Record<string, any> = {};
    if (full_name !== undefined)       profileUpdate.full_name       = full_name?.trim() ?? null;
    if (practice_name !== undefined)   profileUpdate.practice_name   = practice_name?.trim() ?? null;
    if (county !== undefined)          profileUpdate.county          = county?.trim() ?? null;
    if (num_architects !== undefined)  profileUpdate.num_architects  = num_architects;
    if (specialisms !== undefined)     profileUpdate.specialisms     = specialisms;
    if (counties_covered !== undefined) profileUpdate.counties_covered = counties_covered;
    if (email_alerts !== undefined)    profileUpdate.email_alerts    = email_alerts;

    if (Object.keys(profileUpdate).length === 0) {
      return NextResponse.json({ error: "No fields provided." }, { status: 400 });
    }

    const { error: profileError } = await supabase()
      .from("profiles")
      .update(profileUpdate)
      .eq("id", tier.userId);

    if (profileError) {
      console.error("update-profile PATCH profiles error:", profileError);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    // Also update the practices table name if practice_name was provided
    if (practice_name !== undefined) {
      await supabase()
        .from("practices")
        .update({ name: practice_name?.trim() ?? "" })
        .eq("architect_email", tier.email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("update-profile PATCH unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

// GET /api/update-profile — fetch current profile data
export async function GET() {
  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isArchitect) return architectOnly();

  try {
    const { data: profile, error } = await supabase()
      .from("profiles")
      .select("full_name, practice_name, county, num_architects, specialisms, counties_covered, email_alerts, email")
      .eq("id", tier.userId)
      .maybeSingle();

    if (error) {
      console.error("update-profile GET error:", error);
      return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
    }

    return NextResponse.json({
      profile: {
        full_name:        profile?.full_name        ?? "",
        practice_name:    profile?.practice_name    ?? "",
        county:           profile?.county           ?? "",
        email:            tier.email,
        num_architects:   profile?.num_architects   ?? 1,
        specialisms:      profile?.specialisms       ?? [],
        counties_covered: profile?.counties_covered ?? [],
        email_alerts:     profile?.email_alerts     ?? true,
      },
    });
  } catch (err) {
    console.error("update-profile GET unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
