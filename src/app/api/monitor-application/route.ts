import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { validatePlanningRef, validateAuthority, badRequest } from "@/lib/validation";
import { resolveUserTier, unauthorized, paymentRequired } from "@/lib/authGuard";

// Required Supabase table (run once in your Supabase SQL editor):
//
// CREATE TABLE application_monitors (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   email text NOT NULL,
//   reference_number text NOT NULL,
//   county text NOT NULL,
//   created_at timestamptz DEFAULT now()
// );
//
// CREATE INDEX ON application_monitors (reference_number, county);

export async function POST(request: NextRequest) {
  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isPaid) return paymentRequired();

  try {
    const { email, referenceNumber, county } = await request.json();

    if (!email?.trim() || !referenceNumber?.trim() || !county?.trim()) {
      return NextResponse.json(
        { error: "Email, reference number, and county are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const refErr = validatePlanningRef(referenceNumber);
    if (refErr) return badRequest(refErr);

    const authorityErr = validateAuthority(county);
    if (authorityErr) return badRequest(authorityErr);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Avoid duplicate monitors for the same email + application
    const { data: existing } = await supabase
      .from("application_monitors")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .eq("reference_number", referenceNumber.trim())
      .eq("county", county)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        message: "You are already monitoring this application.",
        alreadyMonitoring: true,
      });
    }

    const { error: insertError } = await supabase
      .from("application_monitors")
      .insert({
        email: email.toLowerCase().trim(),
        reference_number: referenceNumber.trim(),
        county,
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to set up monitoring. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Monitoring set up successfully." });
  } catch (error) {
    console.error("monitor-application error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
