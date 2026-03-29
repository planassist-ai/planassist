import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateTextArea, scanFields, badRequest } from "@/lib/validation";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ─── GET — reviews for a professional or builder ──────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const professional_id = searchParams.get("professional_id") ?? "";
  const builder_id      = searchParams.get("builder_id")      ?? "";

  if (!professional_id && !builder_id) {
    return NextResponse.json({ reviews: [] });
  }

  let query = supabase()
    .from("reviews")
    .select("id,rating,review_text,project_type,county,created_at")
    .order("created_at", { ascending: false });

  if (professional_id) query = query.eq("professional_id", professional_id);
  else                 query = query.eq("builder_id",       builder_id);

  const { data, error } = await query;
  if (error) {
    console.error("reviews GET error:", error);
    return NextResponse.json({ reviews: [] });
  }

  return NextResponse.json({ reviews: data ?? [] });
}

// ─── POST — submit a review ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return badRequest("Invalid request body.");
  }

  const { professional_id, builder_id, rating, review_text, project_type, county } = body as {
    professional_id?: string; builder_id?: string;
    rating: number; review_text?: string;
    project_type?: string; county?: string;
  };

  // Exactly one of professional_id or builder_id required
  if (!professional_id && !builder_id) return badRequest("Either professional_id or builder_id is required.");
  if (professional_id && builder_id)   return badRequest("Provide only one of professional_id or builder_id.");

  // Rating validation
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return badRequest("Rating must be a whole number between 1 and 5.");
  }

  // Text validation
  if (review_text) {
    const textErr = validateTextArea(review_text, "Review", 500);
    if (textErr) return badRequest(textErr);
  }

  const scanErr = scanFields(review_text ?? "", project_type ?? "", county ?? "");
  if (scanErr) return badRequest(scanErr);

  // Verify the target exists
  if (professional_id) {
    const { data } = await supabase().from("professionals").select("id").eq("id", professional_id).single();
    if (!data) return NextResponse.json({ error: "Professional not found." }, { status: 404 });
  } else {
    const { data } = await supabase().from("builders").select("id").eq("id", builder_id!).single();
    if (!data) return NextResponse.json({ error: "Builder not found." }, { status: 404 });
  }

  const { error: insertError } = await supabase()
    .from("reviews")
    .insert({
      professional_id: professional_id ?? null,
      builder_id:      builder_id      ?? null,
      rating,
      review_text:     review_text?.trim() || null,
      project_type:    project_type?.trim() || null,
      county:          county?.trim() || null,
    });

  if (insertError) {
    console.error("review insert error:", insertError);
    return NextResponse.json({ error: "Failed to save review. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
