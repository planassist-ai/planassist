import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { badRequest, scanFields } from "@/lib/validation";

// ─── Supabase table (run once in your Supabase SQL editor) ─────────────────────
//
// CREATE TABLE deletion_requests (
//   id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
//   email        text        NOT NULL,
//   requested_at timestamptz DEFAULT now(),
//   status       text        NOT NULL DEFAULT 'pending'
// );
// ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
// -- Allow unauthenticated inserts (public GDPR right)
// CREATE POLICY "allow_public_insert" ON deletion_requests
//   FOR INSERT WITH CHECK (true);
//
// ──────────────────────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY);

// Stricter rate limit for this endpoint: 5 requests per IP per hour
const store = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(request: NextRequest): NextResponse | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const ip = (forwarded ? forwarded.split(",")[0].trim() : real?.trim()) ?? "unknown";
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return null;
  }
  if (entry.count >= 5) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in an hour." },
      { status: 429 }
    );
  }
  entry.count += 1;
  return null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) return badRequest("Email address is required.");
    if (email.length > 254) return badRequest("Email address is too long.");
    if (!EMAIL_REGEX.test(email))
      return badRequest("Please enter a valid email address.");

    const scanErr = scanFields(email);
    if (scanErr) return badRequest(scanErr);

    // ── 1. Record in Supabase ──────────────────────────────────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: insertError } = await supabase
      .from("deletion_requests")
      .insert({ email, status: "pending" });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        {
          error:
            "We could not record your request. Please try again or email us directly at hello@planassist.ie.",
        },
        { status: 500 }
      );
    }

    const from = process.env.RESEND_FROM_EMAIL ?? "PlanAssist <onboarding@resend.dev>";
    const adminEmail = process.env.ADMIN_EMAIL ?? "hello@planassist.ie";
    const submittedOn = new Date().toLocaleDateString("en-IE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // ── 2. Confirmation email to the user ─────────────────────────────────
    await resend.emails.send({
      from,
      to: email,
      subject: "Your data deletion request has been received — PlanAssist",
      text: [
        "Hello,",
        "",
        "We have received your request to delete your personal data from PlanAssist.",
        "",
        "Your request will be processed within 30 days, as required by the General Data Protection Regulation (GDPR) Article 17.",
        "",
        `Once processed, we will delete or anonymise all personal data associated with ${email}, except where we are required to retain certain data by law (for example, records needed for legal compliance).`,
        "",
        "You will receive a follow-up email once your data has been deleted.",
        "",
        "If you have any questions, please reply to this email or contact us at hello@planassist.ie.",
        "",
        `Request reference: ${email} — submitted ${submittedOn}`,
        "",
        "PlanAssist",
        "hello@planassist.ie",
      ].join("\n"),
    });

    // ── 3. Notification email to the admin ────────────────────────────────
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `[Action Required] Data deletion request — ${email}`,
      text: [
        "A new GDPR data deletion request has been submitted via the PlanAssist privacy page.",
        "",
        `Email address: ${email}`,
        `Submitted at:  ${new Date().toISOString()}`,
        `Status:        pending`,
        "",
        "Action required within 30 days (GDPR Art. 17 deadline):",
        "1. Delete or anonymise all rows in the Supabase database associated with this email address.",
        "   Tables to check: auth.users, application_monitors, deletion_requests (mark as completed), and any other user data tables.",
        "2. Update the row in the deletion_requests table: set status = 'completed'.",
        "3. Send the user a confirmation email that their data has been deleted.",
        "",
        "— PlanAssist automated notification",
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("deletion-request unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
