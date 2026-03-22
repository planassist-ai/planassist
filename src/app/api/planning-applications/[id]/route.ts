import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

// Ensure your planning_applications table has this column (run once):
// ALTER TABLE planning_applications ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

const resend = new Resend(process.env.RESEND_API_KEY);

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>) {
  return {
    id:                 row.id,
    referenceNumber:    row.reference_number,
    clientName:         row.client_name,
    clientEmail:        row.client_email ?? undefined,
    propertyAddress:    row.property_address,
    projectDescription: row.project_description,
    status:             row.status,
    submissionDate:     row.submission_date,
    statutoryDeadline:  row.statutory_deadline,
    hasRFI:             row.has_rfi,
    rfiIssuedDate:      row.rfi_issued_date ?? undefined,
    decisionDate:       row.decision_date ?? undefined,
    portalToken:        row.portal_token,
    council:            row.council ?? undefined,
    updatedAt:          row.updated_at ?? undefined,
  };
}

// PATCH /api/planning-applications/[id] — update status (and send FI alert if needed)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!status?.trim()) {
      return NextResponse.json({ error: "status is required." }, { status: 400 });
    }

    // Fetch existing record to detect status transition
    const { data: existing, error: fetchError } = await supabase()
      .from("planning_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const previousStatus = existing.status;

    // Update status and updated_at
    const { data, error } = await supabase()
      .from("planning_applications")
      .update({ status: status.trim(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("planning-applications PATCH error:", error);
      return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
    }

    // Send architect alert when status first moves to Further Information Requested
    if (status === "further_info" && previousStatus !== "further_info") {
      const alertEmail = process.env.ARCHITECT_ALERT_EMAIL;
      if (alertEmail) {
        const deadlineFormatted = new Date(existing.statutory_deadline).toLocaleDateString(
          "en-IE",
          { day: "numeric", month: "long", year: "numeric" }
        );
        try {
          await resend.emails.send({
            from:    process.env.RESEND_FROM_EMAIL ?? "PlanAssist <onboarding@resend.dev>",
            to:      alertEmail,
            subject: `⚠️ Further Information Requested — ${existing.reference_number}`,
            text: [
              "A Further Information request has been issued on the following application.",
              "",
              `Reference: ${existing.reference_number}`,
              `Client:    ${existing.client_name}`,
              `Address:   ${existing.property_address}`,
              `Authority: ${existing.council ?? "N/A"}`,
              `Deadline:  ${deadlineFormatted}`,
              "",
              "Please review the request and coordinate a response with your client before the statutory deadline.",
              "",
              "Log in to PlanAssist to manage this application.",
            ].join("\n"),
          });
        } catch (emailErr) {
          // Non-fatal — status was still saved
          console.error("FI alert email failed:", emailErr);
        }
      } else {
        console.warn(
          "ARCHITECT_ALERT_EMAIL is not set — FI alert email was not sent. " +
          "Add it to .env.local to enable alerts."
        );
      }
    }

    return NextResponse.json({ application: mapRow(data) });
  } catch (err) {
    console.error("planning-applications PATCH unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
