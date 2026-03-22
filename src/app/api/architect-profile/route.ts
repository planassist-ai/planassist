import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Run once in your Supabase SQL editor:
//
// CREATE TABLE architect_profiles (
//   id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
//   practice_name text        NOT NULL,
//   created_at    timestamptz DEFAULT now()
// );

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET /api/architect-profile — return the first profile (single-tenant)
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from("architect_profiles")
      .select("id, practice_name, created_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("architect-profile GET error:", error);
      return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
    }

    return NextResponse.json({ profile: data ?? null });
  } catch (err) {
    console.error("architect-profile GET unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

// POST /api/architect-profile — create a profile
export async function POST(request: NextRequest) {
  try {
    const { practiceName } = await request.json();

    if (!practiceName?.trim()) {
      return NextResponse.json({ error: "practiceName is required." }, { status: 400 });
    }

    const { data, error } = await supabase()
      .from("architect_profiles")
      .insert({ practice_name: practiceName.trim() })
      .select("id, practice_name, created_at")
      .single();

    if (error) {
      console.error("architect-profile POST error:", error);
      return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("architect-profile POST unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
