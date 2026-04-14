import { NextRequest, NextResponse } from "next/server";
import { resolveUserTier, unauthorized, architectOnly } from "@/lib/authGuard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>) {
  return {
    id:             row.id             as string,
    practiceName:   row.name           as string,
    architectEmail: row.architect_email as string | undefined,
    createdAt:      row.created_at     as string,
  };
}

// GET /api/architect-profile — return the first practice for this architect
export async function GET() {
  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isArchitect) return architectOnly();

  try {
    const { data, error } = await tier.db
      .from("practices")
      .select("id, name, architect_email, created_at")
      .eq("architect_email", tier.email)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("architect-profile GET error:", error);
      return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
    }

    return NextResponse.json({ profile: data ? mapRow(data) : null });
  } catch (err) {
    console.error("architect-profile GET unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

// POST /api/architect-profile — create a practice
export async function POST(request: NextRequest) {
  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isArchitect) return architectOnly();

  try {
    const { practiceName, architectEmail } = await request.json();

    if (!practiceName?.trim()) {
      return NextResponse.json({ error: "practiceName is required." }, { status: 400 });
    }

    const { data, error } = await tier.db
      .from("practices")
      .insert({
        name:            practiceName.trim(),
        architect_email: architectEmail?.trim() || tier.email,
      })
      .select("id, name, architect_email, created_at")
      .single();

    if (error) {
      console.error("architect-profile POST error:", error);
      return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
    }

    return NextResponse.json({ profile: mapRow(data) });
  } catch (err) {
    console.error("architect-profile POST unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
