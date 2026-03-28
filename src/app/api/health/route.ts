import { NextResponse } from "next/server";

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
