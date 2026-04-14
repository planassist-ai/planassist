import { NextRequest, NextResponse } from "next/server";
import { resolveUserTier, unauthorized, architectOnly } from "@/lib/authGuard";

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileUpdate: Record<string, any> = {};
    if (full_name !== undefined)        profileUpdate.full_name        = full_name?.trim()       ?? null;
    if (practice_name !== undefined)    profileUpdate.practice_name    = practice_name?.trim()   ?? null;
    if (county !== undefined)           profileUpdate.county           = county?.trim()          ?? null;
    if (num_architects !== undefined)   profileUpdate.num_architects   = num_architects;
    if (specialisms !== undefined)      profileUpdate.specialisms      = specialisms;
    if (counties_covered !== undefined) profileUpdate.counties_covered = counties_covered;
    if (email_alerts !== undefined)     profileUpdate.email_alerts     = email_alerts;

    if (Object.keys(profileUpdate).length === 0) {
      return NextResponse.json({ error: "No fields provided." }, { status: 400 });
    }

    const { error: profileError } = await tier.db
      .from("profiles")
      .update(profileUpdate)
      .eq("id", tier.userId);

    if (profileError) {
      console.error("update-profile PATCH profiles error:", profileError);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    // Also update the practices table name if practice_name was provided
    if (practice_name !== undefined) {
      await tier.db
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
    const { data: profile, error } = await tier.db
      .from("profiles")
      .select("full_name, practice_name, county, num_architects, specialisms, counties_covered, email_alerts")
      .eq("id", tier.userId)
      .maybeSingle();

    if (error) {
      console.error("update-profile GET error:", error);
      return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
    }

    return NextResponse.json({
      profile: {
        full_name:        (profile as { full_name?: string } | null)?.full_name        ?? "",
        practice_name:    (profile as { practice_name?: string } | null)?.practice_name    ?? "",
        county:           (profile as { county?: string } | null)?.county           ?? "",
        email:            tier.email,
        num_architects:   (profile as { num_architects?: number } | null)?.num_architects   ?? 1,
        specialisms:      (profile as { specialisms?: string[] } | null)?.specialisms       ?? [],
        counties_covered: (profile as { counties_covered?: string[] } | null)?.counties_covered ?? [],
        email_alerts:     (profile as { email_alerts?: boolean } | null)?.email_alerts     ?? true,
      },
    });
  } catch (err) {
    console.error("update-profile GET unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
