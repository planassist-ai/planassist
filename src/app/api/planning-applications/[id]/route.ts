import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import {
  VALID_PLANNING_STATUSES,
  validateTextArea,
  scanFields,
  badRequest,
} from "@/lib/validation";
import { resolveUserTier, unauthorized, architectOnly } from "@/lib/authGuard";

// Supabase table: applications
// Columns: id (uuid), reference (text), client_name (text), address (text),
//          council (text), status (text), submission_date (date), deadline_date (date),
//          notes (text), last_updated (timestamptz), practice_id (uuid)

const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role key to bypass RLS — auth is already verified via resolveUserTier()
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>) {
  const portalToken = row.reference
    ? (row.reference as string).toLowerCase().replace(/\//g, "-")
    : row.id;

  return {
    id:               row.id             as string,
    referenceNumber:  row.reference      as string,
    clientName:       row.client_name    as string,
    propertyAddress:  row.address        as string,
    council:          row.council        as string | undefined,
    status:           row.status         as string,
    submissionDate:   row.submission_date as string,
    statutoryDeadline: row.deadline_date as string,
    notes:            row.notes          as string | undefined,
    updatedAt:        row.last_updated   as string | undefined,
    portalToken,
    hasRFI:           false,
    projectDescription: "",
  };
}

// PATCH /api/planning-applications/[id] — update status and/or notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isArchitect) return architectOnly();

  try {
    const { id } = params;
    const body = await request.json();
    const { status, notes } = body;

    if (status === undefined && notes === undefined) {
      return NextResponse.json(
        { error: "Provide at least one of: status, notes." },
        { status: 400 }
      );
    }

    if (status !== undefined) {
      if (typeof status !== "string" || !VALID_PLANNING_STATUSES.has(status.trim())) {
        return badRequest("Invalid status value. Please select a valid planning status.");
      }
    }

    if (notes !== undefined) {
      const notesErr = validateTextArea(notes, "Notes");
      if (notesErr) return badRequest(notesErr);
      const securityErr = scanFields(notes);
      if (securityErr) return badRequest(securityErr);
    }

    // Fetch existing record — filter by user_id to enforce ownership
    const { data: existing, error: fetchError } = await supabase()
      .from("applications")
      .select("*")
      .eq("id", id)
      .eq("user_id", tier.userId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const previousStatus = existing.status;

    // Build update payload — only include provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      last_updated: new Date().toISOString(),
    };
    if (status !== undefined) updatePayload.status = status.trim();
    if (notes !== undefined) updatePayload.notes  = notes;

    const { data, error } = await supabase()
      .from("applications")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", tier.userId)
      .select("*")
      .single();

    if (error) {
      console.error("planning-applications PATCH error:", error);
      return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
    }

    // Send architect alert when status first moves to Further Information Requested
    if (status === "further_info" && previousStatus !== "further_info") {
      // Prefer architect_email from practices table; fall back to env var
      let alertEmail: string | undefined = process.env.ARCHITECT_ALERT_EMAIL;
      if (existing.practice_id) {
        const { data: practice } = await supabase()
          .from("practices")
          .select("architect_email")
          .eq("id", existing.practice_id)
          .single();
        if (practice?.architect_email) alertEmail = practice.architect_email;
      }

      if (alertEmail) {
        const deadlineFormatted = new Date(existing.deadline_date).toLocaleDateString(
          "en-IE",
          { day: "numeric", month: "long", year: "numeric" }
        );
        try {
          await resend.emails.send({
            from:    process.env.RESEND_FROM_EMAIL ?? "Granted <hello@granted.ie>",
            to:      alertEmail,
            subject: `⚠️ Further Information Requested — ${existing.reference}`,
            text: [
              "A Further Information request has been issued on the following application.",
              "",
              `Reference: ${existing.reference}`,
              `Client:    ${existing.client_name}`,
              `Address:   ${existing.address}`,
              `Authority: ${existing.council ?? "N/A"}`,
              `Deadline:  ${deadlineFormatted}`,
              "",
              "Please review the request and coordinate a response with your client before the statutory deadline.",
              "",
              "Log in to Granted to manage this application.",
            ].join("\n"),
          });
        } catch (emailErr) {
          // Non-fatal — status was still saved
          console.error("FI alert email failed:", emailErr);
        }
      } else {
        console.warn(
          "No architect email found (set ARCHITECT_ALERT_EMAIL in .env.local or add architect_email to the practices table)."
        );
      }
    }

    return NextResponse.json({ application: mapRow(data) });
  } catch (err) {
    console.error("planning-applications PATCH unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
