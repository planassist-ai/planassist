import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Supabase table: applications
// Columns: id, reference, client_name, address, council, status,
//          submission_date, deadline_date, notes, last_updated, practice_id

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>) {
  const portalToken = (row.reference as string).toLowerCase().replace(/\//g, "-");
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

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function offsetDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// POST /api/seed-applications
// Inserts 4 realistic demo applications if none exist yet for this practice.
export async function POST(request: NextRequest) {
  try {
    const { practiceId } = await request.json();

    // Check if any applications already exist for this practice
    let check = supabase().from("applications").select("id").limit(1);
    if (practiceId) check = check.eq("practice_id", practiceId);
    const { data: existing } = await check;

    if (existing && existing.length > 0) {
      // Already seeded — return empty so the caller falls through to a normal load
      return NextResponse.json({ seeded: false, applications: [] });
    }

    const now = new Date().toISOString();

    // Compute the RFI date label for App 2
    const rfiDate = isoDate(offsetDate(-5));

    const seeds = [
      // ── 1. Rear extension, Dublin City Council, Under Assessment ──────────
      {
        reference:       "DCC/2025/04821",
        client_name:     "James & Patricia Doyle",
        address:         "34 Clontarf Road, Clontarf, Dublin 3",
        council:         "Dublin City Council",
        status:          "under_assessment",
        submission_date: isoDate(offsetDate(-45)),
        deadline_date:   isoDate(offsetDate(11)),   // 56 − 45 = 11 days remaining
        notes:           "Proposed single-storey rear extension with roof lights, 28 sqm GFA. Party wall notice served on adjoining neighbour.",
        last_updated:    now,
        practice_id:     practiceId ?? null,
      },

      // ── 2. New build, Cork City Council, Further Information Requested ────
      {
        reference:       "PL04B/2025/1205",
        client_name:     "Seán & Maura O'Sullivan",
        address:         "Site at Togher Road, Togher, Cork",
        council:         "Cork City Council",
        status:          "further_info",
        submission_date: isoDate(offsetDate(-62)),
        deadline_date:   isoDate(offsetDate(30)),   // clock extended due to FI
        notes:           `New detached two-storey dwelling, 210 sqm GFA. RFI issued ${rfiDate} — additional flood risk assessment and drainage report required. Response due within 6 months.`,
        last_updated:    new Date(Date.now() - 5 * 86_400_000).toISOString(),
        practice_id:     practiceId ?? null,
      },

      // ── 3. Attic conversion, Galway City Council, Received ────────────────
      {
        reference:       "PL07/2025/0892",
        client_name:     "Michael & Siobhán Connolly",
        address:         "8 Ardaun Park, Renmore, Galway",
        council:         "Galway City Council",
        status:          "received",
        submission_date: isoDate(offsetDate(-12)),
        deadline_date:   isoDate(offsetDate(44)),   // 56 − 12 = 44 days remaining
        notes:           "Attic conversion to habitable bedroom with dormer window to rear, approx. 18 sqm GFA. No protected structure issues.",
        last_updated:    new Date(Date.now() - 12 * 86_400_000).toISOString(),
        practice_id:     practiceId ?? null,
      },

      // ── 4. Side extension, Kildare County Council, Decision Made ──────────
      {
        reference:       "PL09/2025/2341",
        client_name:     "Declan & Fiona Murphy",
        address:         "12 Beechwood Close, Newbridge, Co. Kildare",
        council:         "Kildare County Council",
        status:          "decision_made",
        submission_date: isoDate(offsetDate(-70)),
        deadline_date:   isoDate(offsetDate(-14)),  // deadline has passed — decision made in time
        notes:           `Proposed two-storey side extension, 45 sqm GFA. Granted with 3 conditions (${isoDate(offsetDate(-3))}): matching external materials, landscaping scheme within 3 months, bin storage screening required.`,
        last_updated:    new Date(Date.now() - 3 * 86_400_000).toISOString(),
        practice_id:     practiceId ?? null,
      },
    ];

    const { data, error } = await supabase()
      .from("applications")
      .insert(seeds)
      .select("*");

    if (error) {
      console.error("seed-applications POST error:", error);
      return NextResponse.json({ error: "Failed to seed applications." }, { status: 500 });
    }

    return NextResponse.json({
      seeded: true,
      applications: (data ?? []).map(mapRow),
    });
  } catch (err) {
    console.error("seed-applications POST unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
