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
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const { data, error } = await supabase()
    .from("professionals")
    .select("id,name,practice_name,profession_type,email,phone,website,bio,counties,specialisms,is_verified,is_featured,created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Professional not found." }, { status: 404 });
  }

  return NextResponse.json({ professional: data });
}
