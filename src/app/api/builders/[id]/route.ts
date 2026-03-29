import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

  const [builderRes, reviewsRes] = await Promise.all([
    supabase()
      .from("builders")
      .select("*")
      .eq("id", id)
      .single(),
    supabase()
      .from("reviews")
      .select("id,rating,review_text,project_type,county,created_at")
      .eq("builder_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (builderRes.error || !builderRes.data) {
    return NextResponse.json({ error: "Builder not found." }, { status: 404 });
  }

  const reviews = reviewsRes.data ?? [];
  const avg_rating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating as number), 0) / reviews.length
    : null;

  return NextResponse.json({
    builder: { ...builderRes.data, avg_rating, review_count: reviews.length },
    reviews,
  });
}
