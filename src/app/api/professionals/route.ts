import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateTextArea, scanFields, badRequest } from "@/lib/validation";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_PROFESSION_TYPES = new Set([
  "architect",
  "architectural_technologist",
  "planning_consultant",
  "civil_engineer",
  "land_agent",
  "solicitor",
]);

const VALID_SPECIALISMS = new Set([
  "rural_new_build",
  "extension",
  "commercial",
  "protected_structure",
  "agricultural",
  "retention",
  "change_of_use",
]);

const VALID_COUNTIES = new Set([
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry",
  "Kildare","Kilkenny","Laois","Leitrim","Limerick","Longford","Louth",
  "Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary",
  "Waterford","Westmeath","Wexford","Wicklow",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Supabase client ──────────────────────────────────────────────────────────

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ─── GET — list professionals ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const county    = searchParams.get("county")    ?? "";
  const type      = searchParams.get("type")      ?? "";
  const specialism = searchParams.get("specialism") ?? "";

  try {
    let query = supabase()
      .from("professionals")
      .select("id,name,practice_name,profession_type,phone,website,bio,counties,specialisms,is_verified,is_featured,created_at")
      .order("is_featured", { ascending: false })
      .order("is_verified", { ascending: false })
      .order("created_at",  { ascending: false });

    if (county) {
      query = query.contains("counties", [county]);
    }
    if (type && VALID_PROFESSION_TYPES.has(type)) {
      query = query.eq("profession_type", type);
    }
    if (specialism && VALID_SPECIALISMS.has(specialism)) {
      query = query.contains("specialisms", [specialism]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ professionals: data ?? [] });
  } catch (err) {
    console.error("professionals GET error:", err);
    return NextResponse.json({ professionals: [] });
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
    name, practice_name, profession_type,
    email, phone, website, bio,
    counties, specialisms,
  } = body as {
    name: string; practice_name: string; profession_type: string;
    email: string; phone?: string; website?: string; bio?: string;
    counties: string[]; specialisms: string[];
  };

  // Required field checks
  if (!name?.trim())          return badRequest("Name is required.");
  if (!practice_name?.trim()) return badRequest("Practice name is required.");
  if (!profession_type)       return badRequest("Profession type is required.");
  if (!VALID_PROFESSION_TYPES.has(profession_type)) return badRequest("Invalid profession type.");
  if (!email?.trim())         return badRequest("Email address is required.");
  if (!EMAIL_RE.test(email.trim())) return badRequest("Please enter a valid email address.");
  if (!Array.isArray(counties) || counties.length === 0) return badRequest("Please select at least one county.");
  if (!Array.isArray(specialisms) || specialisms.length === 0) return badRequest("Please select at least one specialism.");

  // Validate county and specialism values
  for (const c of counties) {
    if (!VALID_COUNTIES.has(c)) return badRequest(`"${c}" is not a recognised Irish county.`);
  }
  for (const s of specialisms) {
    if (!VALID_SPECIALISMS.has(s)) return badRequest(`"${s}" is not a recognised specialism.`);
  }

  // Text validation
  const nameErr = validateTextArea(name, "Name", 100);
  if (nameErr) return badRequest(nameErr);
  const practiceErr = validateTextArea(practice_name, "Practice name", 150);
  if (practiceErr) return badRequest(practiceErr);
  const bioErr = bio ? validateTextArea(bio, "Bio", 1000) : null;
  if (bioErr) return badRequest(bioErr);

  // Injection scan
  const scanErr = scanFields(name, practice_name, email, phone ?? "", website ?? "", bio ?? "");
  if (scanErr) return badRequest(scanErr);

  // Insert into Supabase
  const { data: inserted, error: insertError } = await supabase()
    .from("professionals")
    .insert({
      name:            name.trim(),
      practice_name:   practice_name.trim(),
      profession_type,
      email:           email.trim().toLowerCase(),
      phone:           phone?.trim() || null,
      website:         website?.trim() || null,
      bio:             bio?.trim() || null,
      counties,
      specialisms,
      is_verified:     false,
      is_featured:     false,
    })
    .select("id")
    .single();

  if (insertError) {
    // Unique constraint on email means duplicate submission
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "A listing with this email address already exists. Contact us if you need to update your listing." },
        { status: 409 },
      );
    }
    console.error("professionals insert error:", insertError);
    return NextResponse.json({ error: "Failed to save your listing. Please try again." }, { status: 500 });
  }

  // Send confirmation email via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const professionLabels: Record<string, string> = {
      architect: "Architect",
      architectural_technologist: "Architectural Technologist",
      planning_consultant: "Planning Consultant",
      civil_engineer: "Civil Engineer",
      land_agent: "Land Agent",
      solicitor: "Solicitor (Planning)",
    };

    await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? "Planr <onboarding@resend.dev>",
      to:      email.trim().toLowerCase(),
      subject: "Your Planr directory listing has been received",
      text: `Hi ${name.trim().split(" ")[0]},

Thank you for submitting your listing to the Planr Professional Directory.

Your details:
- Name: ${name.trim()}
- Practice: ${practice_name.trim()}
- Profession: ${professionLabels[profession_type] ?? profession_type}
- Counties covered: ${counties.join(", ")}

Your listing is live in the directory at planr.ie/find-a-professional.

We may reach out to verify your listing and add a Verified badge to your profile.

If you need to update your listing or have any questions, please reply to this email.

Best regards,
The Planr Team
planr.ie`,
    });
  } catch (emailErr) {
    // Email failure is non-fatal — listing was saved successfully
    console.error("professionals confirmation email error:", emailErr);
  }

  return NextResponse.json({ success: true, id: inserted?.id });
}
