// ── Granted Demo Environment Data ─────────────────────────────────────────────
// Realistic Irish planning applications for Murphy Architecture demo account.
// All names, addresses, and reference numbers are fictional.

export const DEMO_PRACTICE_NAME = "Murphy Architecture";
export const DEMO_USER_LABEL    = "Murphy Architecture — Demo Account";

export interface DemoPlanningApplication {
  id: string;
  referenceNumber: string;
  clientName: string;
  clientEmail?: string;
  propertyAddress: string;
  projectDescription?: string;
  status:
    | "received"
    | "validated"
    | "under_assessment"
    | "further_info"
    | "fi_response"
    | "decision_made"
    | "appeal";
  submissionDate: string;    // YYYY-MM-DD
  statutoryDeadline: string; // YYYY-MM-DD
  hasRFI?: boolean;
  rfiIssuedDate?: string;
  decisionDate?: string;
  portalToken?: string;
  council?: string;
  notes?: string;
}

// All dates are relative to 2026-03-30 (today in demo environment)
export const DEMO_APPLICATIONS: DemoPlanningApplication[] = [
  {
    id: "demo-1",
    referenceNumber: "DCC/2025/04821",
    clientName: "Murphy Family",
    clientEmail: "aoife.murphy@gmail.com",
    propertyAddress: "14 Beechwood Avenue, Ranelagh, Dublin 6",
    projectDescription: "Rear extension — 28 sqm single-storey kitchen and dining room extension with rooflight",
    status: "under_assessment",
    submissionDate: "2026-02-13",
    statutoryDeadline: "2026-04-17",
    hasRFI: false,
    portalToken: "demo_dcc_04821_murphy",
    council: "Dublin City Council",
    notes: "DCC planner assigned. Validated without queries. Application on display until 7 March. No third-party submissions received. Expect decision by mid-April.",
  },
  {
    id: "demo-2",
    referenceNumber: "PL04B/2025/1205",
    clientName: "O'Brien Family",
    clientEmail: "declan.obrien@icloud.com",
    propertyAddress: "6 Fernleigh Close, Ballincollig, Co. Cork",
    projectDescription: "New detached dwelling — 245 sqm four-bedroom house with detached garage on 0.4 acre site",
    status: "further_info",
    submissionDate: "2026-01-29",
    statutoryDeadline: "2026-04-25",
    hasRFI: true,
    rfiIssuedDate: "2026-03-22",
    portalToken: "demo_pl04b_1205_obrien",
    council: "Cork City Council",
    notes: "RFI received 22 March — 3 items outstanding:\n1. Updated drainage report (percolation test required)\n2. Site boundary clarification at south-eastern corner\n3. Road widening strip dedication to Cork City Council\n\nResponse must be filed within 6 months of RFI date. Preparing drainage report now. Client briefed.",
  },
  {
    id: "demo-3",
    referenceNumber: "PL07/2025/0892",
    clientName: "Walsh Family",
    clientEmail: "siobhan.walsh@eircom.net",
    propertyAddress: "3 Knocknacarra Road, Salthill, Galway",
    projectDescription: "Attic conversion — new rear dormer and staircase to create bedroom with en-suite bathroom",
    status: "decision_made",
    submissionDate: "2025-12-10",
    statutoryDeadline: "2026-02-04",
    hasRFI: false,
    decisionDate: "2026-03-27",
    portalToken: "demo_pl07_0892_walsh",
    council: "Galway City Council",
    notes: "Granted with Conditions — 7 conditions attached to decision.\n\nKey conditions:\n1. Roof tiles to match existing dwelling\n2. Rooflights to be conservation-style, flush-fitting\n3. No further subdivision of attic space\n4. Works to commence within 5 years\n5–7. Standard estate management conditions\n\nAppeal period expires 27 April 2026. Advise client to review all conditions before commencing. No third-party appeals expected.",
  },
  {
    id: "demo-4",
    referenceNumber: "PL09/2025/2341",
    clientName: "Byrne Family",
    clientEmail: "paul.byrne@hotmail.com",
    propertyAddress: "18 Sycamore Drive, Naas, Co. Kildare",
    projectDescription: "Side extension — 22 sqm single-storey utility room and conversion of integral garage to habitable space",
    status: "received",
    submissionDate: "2026-03-18",
    statutoryDeadline: "2026-05-13",
    hasRFI: false,
    portalToken: "demo_pl09_2341_byrne",
    council: "Kildare County Council",
    notes: "Submitted 18 March. Awaiting validation — Kildare typically validates within 2–3 weeks. Note: client confirmed 7-year local residency, satisfying local needs if queried. No gap policy issue (infill site in existing estate).",
  },
  {
    id: "demo-5",
    referenceNumber: "PL06/2025/0445",
    clientName: "O'Sullivan Family",
    clientEmail: "margaret.osullivan@gmail.com",
    propertyAddress: "Cloghane, Tralee, Co. Kerry",
    projectDescription: "Replacement dwelling — demolition of existing derelict cottage and construction of new two-storey dwelling (185 sqm)",
    status: "appeal",
    submissionDate: "2025-10-14",
    statutoryDeadline: "2026-01-06",
    hasRFI: false,
    portalToken: "demo_pl06_0445_osullivan",
    council: "Kerry County Council",
    notes: "Kerry County Council refused 19 December — reason: applicant does not satisfy rural housing local need (no 7-year local connection demonstrated).\n\nAppeal filed 15 January to An Coimisiún Pleanála.\nGrounds: (1) replacement dwelling policy for structurally weak rural areas (2) derelict site precedent (3) family connection to landholding.\n\nOral hearing expected Q2 2026. Attending with client. Counsel briefed.",
  },
];

export interface DemoActivityLog {
  id: string;
  timestamp: string; // ISO 8601
  type: "status_change" | "note_saved" | "email_sent";
  description: string;
}

export const DEMO_ACTIVITY_LOGS: Record<string, DemoActivityLog[]> = {
  "demo-1": [
    { id: "d1-3", timestamp: "2026-02-19T11:30:00.000Z", type: "status_change", description: "Status changed to Under Assessment" },
    { id: "d1-2", timestamp: "2026-02-17T09:10:00.000Z", type: "status_change", description: "Status changed to Validated" },
    { id: "d1-1", timestamp: "2026-02-13T09:00:00.000Z", type: "status_change", description: "Application added — status: Received" },
  ],
  "demo-2": [
    { id: "d2-5", timestamp: "2026-03-22T10:31:00.000Z", type: "email_sent",    description: "Client update sent to declan.obrien@icloud.com" },
    { id: "d2-4", timestamp: "2026-03-22T10:15:00.000Z", type: "status_change", description: "Status changed to Further Information Requested — RFI issued by Cork City Council" },
    { id: "d2-3", timestamp: "2026-02-12T14:00:00.000Z", type: "status_change", description: "Status changed to Under Assessment" },
    { id: "d2-2", timestamp: "2026-02-05T11:00:00.000Z", type: "status_change", description: "Status changed to Validated" },
    { id: "d2-1", timestamp: "2026-01-29T09:00:00.000Z", type: "status_change", description: "Application added — status: Received" },
  ],
  "demo-3": [
    { id: "d3-5", timestamp: "2026-03-27T16:18:00.000Z", type: "email_sent",    description: "Client update sent to siobhan.walsh@eircom.net" },
    { id: "d3-4", timestamp: "2026-03-27T16:00:00.000Z", type: "status_change", description: "Status changed to Decision Made — Granted with Conditions (7 conditions attached)" },
    { id: "d3-3", timestamp: "2026-01-05T10:00:00.000Z", type: "status_change", description: "Status changed to Under Assessment" },
    { id: "d3-2", timestamp: "2025-12-22T14:00:00.000Z", type: "status_change", description: "Status changed to Validated" },
    { id: "d3-1", timestamp: "2025-12-10T09:00:00.000Z", type: "status_change", description: "Application added — status: Received" },
  ],
  "demo-4": [
    { id: "d4-1", timestamp: "2026-03-18T09:00:00.000Z", type: "status_change", description: "Application added — status: Received" },
  ],
  "demo-5": [
    { id: "d5-6", timestamp: "2026-01-15T13:32:00.000Z", type: "email_sent",    description: "Client update sent to margaret.osullivan@gmail.com" },
    { id: "d5-5", timestamp: "2026-01-15T13:00:00.000Z", type: "status_change", description: "Status changed to Appealed — Appeal filed to An Coimisiún Pleanála" },
    { id: "d5-4", timestamp: "2025-12-19T11:00:00.000Z", type: "status_change", description: "Status changed to Decision Made — Refused (rural housing local need not satisfied)" },
    { id: "d5-3", timestamp: "2025-11-18T10:00:00.000Z", type: "status_change", description: "Status changed to Under Assessment" },
    { id: "d5-2", timestamp: "2025-10-28T14:30:00.000Z", type: "status_change", description: "Status changed to Validated" },
    { id: "d5-1", timestamp: "2025-10-14T09:00:00.000Z", type: "status_change", description: "Application added — status: Received" },
  ],
};
