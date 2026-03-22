import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Run once in your Supabase SQL editor:
//
// CREATE TABLE application_notes (
//   id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
//   reference_number text    NOT NULL UNIQUE,
//   notes        text        NOT NULL DEFAULT '',
//   updated_at   timestamptz DEFAULT now()
// );
// CREATE INDEX ON application_notes (reference_number);

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET /api/application-notes — return all notes rows
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from("application_notes")
      .select("reference_number, notes, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("application-notes GET error:", error);
      return NextResponse.json({ error: "Failed to load notes." }, { status: 500 });
    }

    return NextResponse.json({ notes: data ?? [] });
  } catch (err) {
    console.error("application-notes GET unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

// POST /api/application-notes — upsert notes for one application
export async function POST(request: NextRequest) {
  try {
    const { referenceNumber, notes } = await request.json();

    if (!referenceNumber?.trim()) {
      return NextResponse.json({ error: "referenceNumber is required." }, { status: 400 });
    }

    if (typeof notes !== "string") {
      return NextResponse.json({ error: "notes must be a string." }, { status: 400 });
    }

    const { data, error } = await supabase()
      .from("application_notes")
      .upsert(
        {
          reference_number: referenceNumber.trim(),
          notes: notes.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "reference_number" }
      )
      .select("reference_number, notes, updated_at")
      .single();

    if (error) {
      console.error("application-notes POST error:", error);
      return NextResponse.json({ error: "Failed to save notes." }, { status: 500 });
    }

    return NextResponse.json({ note: data });
  } catch (err) {
    console.error("application-notes POST unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
