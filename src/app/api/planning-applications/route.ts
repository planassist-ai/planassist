import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Run once in your Supabase SQL editor:
//
// CREATE TABLE planning_applications (
//   id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
//   reference_number    text        NOT NULL UNIQUE,
//   client_name         text        NOT NULL,
//   client_email        text,
//   property_address    text        NOT NULL,
//   project_description text        NOT NULL DEFAULT '',
//   status              text        NOT NULL DEFAULT 'received',
//   submission_date     date        NOT NULL,
//   statutory_deadline  date        NOT NULL,
//   has_rfi             boolean     NOT NULL DEFAULT false,
//   rfi_issued_date     date,
//   decision_date       date,
//   portal_token        text        NOT NULL,
//   council             text,
//   created_at          timestamptz DEFAULT now()
// );
// CREATE INDEX ON planning_applications (reference_number);

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>) {
  return {
    id:                 row.id              as string,
    referenceNumber:    row.reference_number as string,
    clientName:         row.client_name      as string,
    clientEmail:        row.client_email     as string | undefined,
    propertyAddress:    row.property_address as string,
    projectDescription: row.project_description as string,
    status:             row.status           as string,
    submissionDate:     row.submission_date  as string,
    statutoryDeadline:  row.statutory_deadline as string,
    hasRFI:             row.has_rfi          as boolean,
    rfiIssuedDate:      row.rfi_issued_date  as string | undefined,
    decisionDate:       row.decision_date    as string | undefined,
    portalToken:        row.portal_token     as string,
    council:            row.council          as string | undefined,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// GET /api/planning-applications — return all applications
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from("planning_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("planning-applications GET error:", error);
      return NextResponse.json({ error: "Failed to load applications." }, { status: 500 });
    }

    return NextResponse.json({ applications: (data ?? []).map(mapRow) });
  } catch (err) {
    console.error("planning-applications GET unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

// POST /api/planning-applications — create a new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      referenceNumber,
      clientName,
      clientEmail,
      propertyAddress,
      projectDescription,
      status,
      submissionDate,
      statutoryDeadline,
      council,
    } = body;

    if (!referenceNumber?.trim() || !clientName?.trim() || !propertyAddress?.trim() || !submissionDate) {
      return NextResponse.json(
        { error: "referenceNumber, clientName, propertyAddress and submissionDate are required." },
        { status: 400 }
      );
    }

    const deadline =
      statutoryDeadline?.trim() || addDays(submissionDate, 56); // default: 8 weeks

    const token = `pa_live_${Math.random().toString(36).slice(2, 10)}`;

    const { data, error } = await supabase()
      .from("planning_applications")
      .insert({
        reference_number:    referenceNumber.trim(),
        client_name:         clientName.trim(),
        client_email:        clientEmail?.trim() || null,
        property_address:    propertyAddress.trim(),
        project_description: (projectDescription ?? "").trim(),
        status:              status ?? "received",
        submission_date:     submissionDate,
        statutory_deadline:  deadline,
        has_rfi:             false,
        portal_token:        token,
        council:             council?.trim() || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("planning-applications POST error:", error);
      return NextResponse.json({ error: "Failed to save application." }, { status: 500 });
    }

    return NextResponse.json({ application: mapRow(data) });
  } catch (err) {
    console.error("planning-applications POST unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
