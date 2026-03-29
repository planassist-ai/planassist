import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateTextArea, scanFields, badRequest } from "@/lib/validation";

const VALID_TRADE_TYPES = new Set([
  "general_contractor","groundworks","extension_specialist",
  "new_build_specialist","renovation_specialist","fit_out_specialist",
]);

const VALID_COUNTIES = new Set([
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry",
  "Kildare","Kilkenny","Laois","Leitrim","Limerick","Longford","Louth",
  "Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary",
  "Waterford","Westmeath","Wexford","Wicklow",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ─── GET — list builders ──────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const county    = searchParams.get("county")    ?? "";
  const tradeType = searchParams.get("trade")     ?? "";

  try {
    let query = supabase()
      .from("builders")
      .select("id,company_name,contact_name,trade_types,project_size_min,project_size_max,counties,phone,website,bio,insurance_confirmed,tax_compliant,is_verified,is_featured,created_at")
      .order("is_featured", { ascending: false })
      .order("is_verified",  { ascending: false })
      .order("created_at",   { ascending: false });

    if (county) query = query.contains("counties", [county]);
    if (tradeType && VALID_TRADE_TYPES.has(tradeType)) {
      query = query.contains("trade_types", [tradeType]);
    }

    const { data: builders, error } = await query;
    if (error) throw error;

    // Fetch average ratings for all returned builders
    const ids = (builders ?? []).map(b => b.id as string);
    const ratingsMap: Record<string, { avg: number; count: number }> = {};

    if (ids.length > 0) {
      const { data: reviews } = await supabase()
        .from("reviews")
        .select("builder_id,rating")
        .in("builder_id", ids);

      if (reviews) {
        const grouped: Record<string, number[]> = {};
        for (const r of reviews) {
          if (r.builder_id) {
            grouped[r.builder_id as string] ??= [];
            grouped[r.builder_id as string].push(r.rating as number);
          }
        }
        for (const [id, ratings] of Object.entries(grouped)) {
          ratingsMap[id] = {
            avg:   ratings.reduce((a, b) => a + b, 0) / ratings.length,
            count: ratings.length,
          };
        }
      }
    }

    const result = (builders ?? []).map(b => ({
      ...b,
      avg_rating:   ratingsMap[b.id as string]?.avg   ?? null,
      review_count: ratingsMap[b.id as string]?.count ?? 0,
    }));

    return NextResponse.json({ builders: result });
  } catch (err) {
    console.error("builders GET error:", err);
    return NextResponse.json({ builders: [] });
  }
}

// ─── POST — create listing ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return badRequest("Invalid request body.");
  }

  const {
    company_name, contact_name, trade_types, project_size_min,
    project_size_max, counties, email, phone, website, bio,
    insurance_confirmed, tax_compliant,
  } = body as {
    company_name: string; contact_name: string; trade_types: string[];
    project_size_min?: number; project_size_max?: number; counties: string[];
    email: string; phone?: string; website?: string; bio?: string;
    insurance_confirmed: boolean; tax_compliant: boolean;
  };

  if (!company_name?.trim())  return badRequest("Company name is required.");
  if (!contact_name?.trim())  return badRequest("Contact name is required.");
  if (!email?.trim())         return badRequest("Email address is required.");
  if (!EMAIL_RE.test(email.trim())) return badRequest("Please enter a valid email address.");
  if (!Array.isArray(trade_types) || trade_types.length === 0) return badRequest("Please select at least one trade type.");
  if (!Array.isArray(counties) || counties.length === 0) return badRequest("Please select at least one county.");

  for (const t of trade_types) {
    if (!VALID_TRADE_TYPES.has(t)) return badRequest(`"${t}" is not a valid trade type.`);
  }
  for (const c of counties) {
    if (!VALID_COUNTIES.has(c)) return badRequest(`"${c}" is not a recognised Irish county.`);
  }

  const companyErr = validateTextArea(company_name, "Company name", 150);
  if (companyErr) return badRequest(companyErr);
  const bioErr = bio ? validateTextArea(bio, "Bio", 1000) : null;
  if (bioErr) return badRequest(bioErr);

  const scanErr = scanFields(company_name, contact_name, email, phone ?? "", website ?? "", bio ?? "");
  if (scanErr) return badRequest(scanErr);

  const { data: inserted, error: insertError } = await supabase()
    .from("builders")
    .insert({
      company_name:        company_name.trim(),
      contact_name:        contact_name.trim(),
      trade_types,
      project_size_min:    project_size_min ?? null,
      project_size_max:    project_size_max ?? null,
      counties,
      email:               email.trim().toLowerCase(),
      phone:               phone?.trim() || null,
      website:             website?.trim() || null,
      bio:                 bio?.trim() || null,
      insurance_confirmed: insurance_confirmed === true,
      tax_compliant:       tax_compliant === true,
      is_verified:         false,
      is_featured:         false,
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "A listing with this email address already exists." },
        { status: 409 },
      );
    }
    console.error("builders insert error:", insertError);
    return NextResponse.json({ error: "Failed to save listing. Please try again." }, { status: 500 });
  }

  // Confirmation email
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const tradeLabels: Record<string, string> = {
      general_contractor: "General Contractor", groundworks: "Groundworks Specialist",
      extension_specialist: "Extension Specialist", new_build_specialist: "New Build Specialist",
      renovation_specialist: "Renovation Specialist", fit_out_specialist: "Fit-Out Specialist",
    };
    await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? "Granted <onboarding@resend.dev>",
      to:      email.trim().toLowerCase(),
      subject: "Your Granted builders directory listing has been received",
      text: `Hi ${contact_name.trim().split(" ")[0]},

Thank you for submitting your listing to the Granted Builders Directory.

Your details:
- Company: ${company_name.trim()}
- Trade types: ${trade_types.map(t => tradeLabels[t] ?? t).join(", ")}
- Counties covered: ${counties.join(", ")}

Your listing is now live at planr.ie/find-a-professional.

Best regards,
The Granted Team`,
    });
  } catch (emailErr) {
    console.error("builders confirmation email error:", emailErr);
  }

  return NextResponse.json({ success: true, id: inserted?.id });
}
