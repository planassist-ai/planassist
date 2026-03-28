import { NextResponse } from "next/server";

// Health check reads only process.env — safe to cache for 5 minutes at the edge
export const revalidate = 300;

export async function GET() {
  const allConfigured =
    !!process.env.ANTHROPIC_API_KEY &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.RESEND_API_KEY;

  return NextResponse.json({
    status: "ok",
    ready: allConfigured,
  });
}
