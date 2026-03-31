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

// ── Demo Scenario Results ──────────────────────────────────────────────────────
// Pre-canned checker results used by homepage scenario cards in demo mode.
// flowType must match FlowType in check/page.tsx.

export interface DemoScenario {
  flowType: string;
  county: string;
  result: {
    outcome: "EXEMPT" | "LIKELY_NEEDS_PERMISSION" | "DEFINITELY_NEEDS_PERMISSION";
    headline: string;
    explanation: string;
    keyPoints: string[];
    caveat: string;
  };
}

export const DEMO_SCENARIO_RESULTS: Record<string, DemoScenario> = {
  "rear-extension": {
    flowType: "extension",
    county: "Dublin",
    result: {
      outcome: "EXEMPT",
      headline: "Your rear extension is likely exempt from planning permission.",
      explanation: "A single-storey rear extension of 28 sqm to a semi-detached house in Dublin falls comfortably within the exempted development thresholds under the Planning and Development Regulations 2001, as updated by the Planning and Development Act 2024 regulations effective March 2026.\n\nFor semi-detached and terraced houses, rear extensions up to 40 sqm are exempt development, provided the extension does not reduce the rear garden to less than 25 sqm and the height does not exceed the eaves of the existing house. Based on the details provided, all three conditions are met.\n\nNote that if the property is a protected structure or within an Architectural Conservation Area (ACA), the standard exemptions do not apply and planning permission would be required regardless of size.",
      keyPoints: [
        "Extension size (28 sqm) is within the 40 sqm exempt threshold for semi-detached houses",
        "Single-storey design — roof height restriction does not apply",
        "Rear garden remains above the 25 sqm minimum required",
        "No protected structure designation — standard national exemptions apply",
      ],
      caveat: "Confirm the total of all previous extensions does not bring the cumulative rear extension area above 40 sqm before commencing works.",
    },
  },
  "rural-new-build": {
    flowType: "new-build",
    county: "Kerry",
    result: {
      outcome: "LIKELY_NEEDS_PERMISSION",
      headline: "Planning permission is required — your case has good prospects with the right evidence.",
      explanation: "A new dwelling in rural Kerry always requires planning permission — there is no exemption for new builds anywhere in Ireland. However, your situation presents a reasonable case under Kerry County Council's rural housing policy.\n\nKerry applies a moderate rural housing policy. The key test is demonstrating genuine local need — the strongest basis being a family landholding connection that has been in the family for a sustained period. Kerry's County Development Plan recognises both 'active rural areas' and 'structurally weak rural areas', with slightly different criteria applying in each.\n\nWith a family landholding and a demonstrable local connection, applications in rural Kerry are regularly approved. A well-prepared planning report from an experienced architect or planning consultant significantly improves approval prospects.",
      keyPoints: [
        "Planning permission is always required for new rural dwellings — no exemption exists",
        "Kerry is a moderate rural county — genuine local needs applicants regularly succeed",
        "Family landholding connection is the strongest possible basis for an application",
        "Percolation test and site suitability assessment will be required by the planning authority",
      ],
      caveat: "Engage an architect or planning consultant with Kerry County Council experience before lodging — a properly prepared planning report is essential.",
    },
  },
  "retention": {
    flowType: "retention",
    county: "Cork",
    result: {
      outcome: "LIKELY_NEEDS_PERMISSION",
      headline: "A retention application is possible — act promptly before enforcement becomes an issue.",
      explanation: "Works carried out without planning permission can be regularised through a retention application under section 34(12) of the Planning and Development Act 2000. In your case, the works appear to be within a size range that Cork City Council may be prepared to consider for retention, provided no enforcement action is already underway.\n\nRetention applications are assessed on the same merits as a standard planning application — the council will consider whether the works would have been approved had they applied in advance. For a rear extension to a semi-detached house, the key question is whether the works fall within or close to the national exempted development thresholds.\n\nThe most urgent priority is to check whether Cork City Council has issued any warning letters or enforcement notices. If enforcement proceedings are active, time limits on responses are strict and you should consult a planning consultant or solicitor immediately.",
      keyPoints: [
        "Retention is assessed on the same merits as a standard planning application",
        "No active enforcement action noted — act promptly before this changes",
        "Works appear to be within a size range Cork City Council may accept for retention",
        "A planning report from an architect or consultant will substantially strengthen the application",
      ],
      caveat: "Check the Cork City Council enforcement register immediately to confirm no warning letter or enforcement notice has been issued against the property.",
    },
  },
};

// ── Demo Document Interpreter Result ──────────────────────────────────────────
// Pre-built sample RFI result used in demo mode — bypasses the Anthropic API.

export const DEMO_INTERPRETER_RESULT = {
  verdictType: "neutral" as const,
  verdict: "Dublin City Council has requested three items of further information — the application is not in trouble, but you must respond within six months or it will be automatically withdrawn.",
  summary: "Dublin City Council has issued a Request for Further Information (RFI) under Section 132 of the Planning and Development Act 2000 (as amended) in relation to planning application DCC/2025/04821 for a single-storey rear extension at 14 Beechwood Avenue, Ranelagh, Dublin 6.\n\nAn RFI means the planning authority needs some additional information before it can make a decision. It is not a refusal, and it is not unusual — many straightforward applications receive an RFI. The important thing is to respond promptly and fully. Once your response is received, Dublin City Council has 4 weeks to issue a decision.\n\nThere are three items to address: a revised site layout plan showing the exact boundary between the proposed extension and the neighbouring property, an updated drainage layout showing how surface water runoff from the new roof will be managed, and a shadow study confirming that the extension will not cause undue overshadowing of the neighbouring rear garden during the winter months. All three are standard requests for this type of extension in Dublin.",
  actions: [
    {
      action: "Commission a revised site layout plan from your architect showing the precise boundary distance between the proposed extension and the shared boundary with No. 16 Beechwood Avenue. The plan must be to scale (1:200 or 1:500) and reference the Ordnance Survey Ireland datum.",
      priority: "urgent" as const,
    },
    {
      action: "Prepare and submit an updated drainage layout drawing showing how surface water from the new extension roof will be discharged — typically to an existing soakpit, rainwater harvesting tank, or existing surface water drain. Your architect or engineer can prepare this.",
      priority: "urgent" as const,
    },
    {
      action: "Commission a basic shadow study (sun path diagram or shadow projection drawing) confirming that the proposed extension will not cause material overshadowing of the rear garden at 16 Beechwood Avenue during the winter solstice (21 December) between 9am and 3pm.",
      priority: "normal" as const,
    },
  ],
  deadlines: [
    "Respond to the RFI within 6 months of the date of the request letter (issued 15 March 2026) — deadline: 15 September 2026. Failure to respond by this date will result in the planning application being automatically withdrawn.",
    "Once Dublin City Council receives your complete response, they have 4 weeks to issue a decision on the application.",
  ],
};

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
