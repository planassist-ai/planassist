import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  validatePlanningRef,
  validateTextArea,
  scanFields,
  badRequest,
} from "@/lib/validation";

// Supabase table: applications
// Columns: id (uuid), reference (text), client_name (text), address (text),
//          council (text), status (text), submission_date (date), deadline_date (date),
//          notes (text), last_updated (timestamptz), practice_id (uuid)

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>) {
  // Generate a stable portal token from the reference since there is no portal_token column
  const portalToken = row.reference
    ? (row.reference as string).toLowerCase().replace(/\//g, "-")
    : row.id;

  return {
    id:               row.id            as string,
    referenceNumber:  row.reference     as string,
    clientName:       row.client_name   as string,
    propertyAddress:  row.address       as string,
    council:          row.council       as string | undefined,
    status:           row.status        as string,
    submissionDate:   row.submission_date as string,
    statutoryDeadline: row.deadline_date as string,
    notes:            row.notes         as string | undefined,
    updatedAt:        row.last_updated  as string | undefined,
    portalToken,
    // Fields not stored in DB — set safe defaults
    hasRFI:           false,
    projectDescription: "",
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// GET /api/planning-applications — return all applications ordered by last updated
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from("applications")
      .select("*")
      .order("last_updated", { ascending: false });

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
      address,
      propertyAddress, // accept either key
      council,
      status,
      submissionDate,
      statutoryDeadline,
      deadlineDate,     // accept either key
      practiceId,
    } = body;

    const ref     = referenceNumber?.trim();
    const client  = clientName?.trim();
    const addr    = (address ?? propertyAddress)?.trim();
    const subDate = submissionDate;

    if (!ref || !client || !addr || !subDate) {
      return NextResponse.json(
        { error: "referenceNumber, clientName, address and submissionDate are required." },
        { status: 400 }
      );
    }

    const refErr = validatePlanningRef(ref);
    if (refErr) return badRequest(refErr);

    const nameErr = validateTextArea(client, "Client name", 100);
    if (nameErr) return badRequest(nameErr);

    const addrErr = validateTextArea(addr, "Property address", 200);
    if (addrErr) return badRequest(addrErr);

    const councilVal = council?.trim();
    if (councilVal) {
      const councilErr = validateTextArea(councilVal, "Council", 100);
      if (councilErr) return badRequest(councilErr);
    }

    const securityErr = scanFields(client, addr, councilVal);
    if (securityErr) return badRequest(securityErr);

    const deadline = (deadlineDate ?? statutoryDeadline)?.trim() || addDays(subDate, 56);

    const { data, error } = await supabase()
      .from("applications")
      .insert({
        reference:       ref,
        client_name:     client,
        address:         addr,
        council:         council?.trim() || null,
        status:          status ?? "received",
        submission_date: subDate,
        deadline_date:   deadline,
        notes:           "",
        last_updated:    new Date().toISOString(),
        practice_id:     practiceId ?? null,
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
