import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateCounty, validateTextArea, scanFields, badRequest } from "@/lib/validation";

const client = new Anthropic();

// ─── County Development Plan policy references ────────────────────────────────

const COUNTY_CDP_POLICIES: Record<string, string> = {
  Carlow: `Carlow County Development Plan 2022–2028. Key policies: Policy RH1 (rural housing outside settlements), Policy RH2 (local rural housing needs), Policy NH1 (landscape character), Policy TI1 (traffic and access). Carlow applies a moderate local needs test — applicants with a genuine rural background or working connection are generally supported outside settlements identified in the Core Strategy.`,

  Cavan: `Cavan County Development Plan 2022–2028. Key policies: Policy RH1 (rural housing — positive in structurally weak areas), Policy RH2 (local needs rural housing), Policy NH1 (scenic landscape protection). Cavan is broadly supportive of rural housing, with specific encouragement for native returnees and those with generational connections to the land. Policy explicitly supports population retention in rural areas.`,

  Clare: `Clare County Development Plan 2023–2029. Key policies: Policy RPH1 (rural housing in open countryside), Policy RPH2 (ribbon development prevention), Policy NH1 (Burren and Geopark protections), Policy RPH3 (local needs test). Clare applies a dual standard: inland and structurally weak areas are broadly supportive; the Burren SAAO, Atlantic coastline (Loop Head, Kilkee), and environs of Ennis town are subject to stricter policies. BurrenLIFE and NPWS designations apply in the Burren.`,

  Cork: `Cork County Development Plan 2022–2028. Key policies: Policy RH 3-1 (rural housing in the countryside), Policy RH 3-2 (local rural housing need), Policy NH 3-1 (landscape and scenic routes). Cork applies a tiered approach: strong restrictions in the Metropolitan Cork Green Belt and areas under pressure (Carrigaline, Kinsale environs, North Cork gateway); rural areas away from the city fringe are more permissive with genuine local connection. South County Cork and West Cork are moderate-to-permissive.`,

  Donegal: `Donegal County Development Plan 2018–2024 (being updated). Key policies: Policy NH-RD-1 (rural housing), Policy NH-RD-3 (social and economic need), Policy NH-LA-1 (landscape and natural heritage). Donegal is broadly supportive of rural housing for those with a genuine connection to the county. The Wild Atlantic Way corridor and offshore islands have enhanced landscape protection requirements. The CDP explicitly supports population retention in remote areas.`,

  Dublin: `Dublin City Development Plan 2022–2028 and the three county council development plans (Fingal CDP 2023–2029, South Dublin CDP 2022–2028, Dún Laoghaire-Rathdown CDP 2022–2028). Rural housing policy is restrictive across all Dublin authorities. Fingal CDP Policy RH01 restricts rural one-off dwellings to agricultural need or proven exceptional circumstances. Dún Laoghaire-Rathdown and South Dublin have effectively no open countryside for rural housing. Dublin City is urban — all residential development assessed under residential design standards and the Urban Development and Building Heights Guidelines 2018.`,

  Galway: `Galway County Development Plan 2022–2028. Key policies: Policy RH-1 (rural housing need), Policy RH-2 (local connection test), Policy NH-1 (landscape character areas), Policy Connemara Gaeltacht special provisions. Galway applies a genuine local connection test — those born in the county or working there with demonstrable need are supported. The Connemara Gaeltacht, Atlantic coastline and protected landscape areas (SAAO) have heightened requirements. Galway City Development Plan 2023–2029 governs urban areas with standard residential policies.`,

  Kerry: `Kerry County Development Plan 2022–2028. Key policies: Policy RPH-01 (rural housing need), Policy RPH-02 (design and siting), Policy NH-01 (landscape protection — particularly Ring of Kerry and Dingle Peninsula ASAOs). Kerry is moderately supportive of rural housing for applicants with genuine local connection. The Wild Atlantic Way corridor, Ring of Kerry, and Dingle Peninsula are subject to enhanced landscape sensitivity requirements. Kerry Mountain Rescue areas have additional access considerations.`,

  Kildare: `Kildare County Development Plan 2023–2029. Key policies: Policy RH1 (rural housing — strict local needs test), Policy RH2 (agricultural/occupational needs), Policy G1 (Green Belt — environs of Naas, Newbridge, Maynooth). Kildare applies a strict local needs test given proximity to Dublin. Genuine agricultural need or demonstrable exceptional local connection is required. Metropolitan Area Settlement Strategy restricts further rural one-off development close to Maynooth, Celbridge, Naas and Newbridge corridors.`,

  Kilkenny: `Kilkenny County Development Plan 2021–2027. Key policies: Policy RH-1 (rural housing — local connection or agricultural need), Policy NH-1 (Nore Valley and scenic landscapes), Policy RH-2 (design in rural areas). Kilkenny applies a moderate local needs test. Applicants with a genuine connection to the county, including returning emigrants and those working locally, are generally supported. The Nore Valley, Castlecomer Plateau and scenic routes have heightened landscape sensitivity.`,

  Laois: `Laois County Development Plan 2021–2027. Key policies: Policy RH-1 (rural housing — local needs), Policy RH-2 (agricultural need), Policy NH-1 (Slieve Bloom Mountains SPA protections). Laois is moderately supportive of rural housing. The Slieve Bloom Mountains and adjoining upland areas require careful landscape siting. The county has active population retention policies supporting those with local rural connections.`,

  Leitrim: `Leitrim County Development Plan 2023–2029. Key policies: Policy RH-1 (rural housing — broadly supportive), Policy RH-2 (local connection), Policy RH-3 (design standards). Leitrim is among the most permissive counties for rural housing, with an explicit population retention strategy. The CDP acknowledges ongoing rural depopulation and actively encourages new rural dwellings from those with any meaningful connection to the county. Design standards focus on low-impact, landscape-sympathetic design.`,

  Limerick: `Limerick City and County Development Plan 2022–2028. Key policies: Policy RH-1 (rural housing in open countryside), Policy RH-2 (local rural housing need), Policy NH-1 (Shannon Estuary Special Amenity Area). Limerick applies a moderate local needs test with distinction between the commuter hinterland of Limerick City (stricter) and remote rural west Limerick (more permissive). The Shannon Estuary Wild Atlantic Way corridor has landscape sensitivity requirements.`,

  Longford: `Longford County Development Plan 2021–2027. Key policies: Policy RH-1 (rural housing — supportive policy for population retention), Policy RH-2 (local connection or agricultural need). Longford is broadly supportive of rural housing given its structurally weak rural status. The CDP includes explicit policies to encourage population growth in rural areas. Design guidance emphasises traditional Midlands architectural character.`,

  Louth: `Louth County Development Plan 2021–2027. Key policies: Policy RH-1 (rural housing — strict given proximity to Dublin/Belfast corridor), Policy RH-2 (agricultural/exceptional need), Policy RH-3 (Grange and Carlingford Heritage Town environs). Louth applies a strict local needs test. The Dublin–Belfast economic corridor, M1 motorway corridor and Carlingford Lough ASAO all have heightened restrictions. Genuine agricultural need or proven lifelong connection is typically required.`,

  Mayo: `Mayo County Development Plan 2022–2028. Key policies: Policy RPH-1 (rural housing — broadly supportive), Policy RPH-2 (local connection), Policy NH-1 (Wild Atlantic Way and Clew Bay). Mayo is broadly supportive of rural housing, with population retention a core county goal. Wild Atlantic Way coastal zone and Croagh Patrick environs have enhanced landscape requirements. The CDP actively encourages diaspora returnees and those with any meaningful county connection.`,

  Meath: `Meath County Development Plan 2021–2027. Key policies: Policy RH-1 (rural housing — strict given Dublin Metropolitan Area influence), Policy RH-2 (agricultural need), Policy RH-3 (Boyne Valley World Heritage Site buffer zone). Meath applies a strict local needs test given MASP designation and proximity to Dublin. The Boyne Valley Archaeological Landscape (Newgrange/Knowth) and Lough Sheelin environs have additional heritage protection. Agricultural need or long-standing family landholding typically required.`,

  Monaghan: `Monaghan County Development Plan 2019–2025 (under review). Key policies: Policy RH-1 (rural housing — broadly supportive), Policy RH-2 (local connection), Policy RH-3 (border area and drumlin landscape). Monaghan is broadly supportive of rural housing. The distinctive drumlin landscape requires sensitive siting and design. The CDP supports cross-border connectivity and encourages population retention throughout the county.`,

  Offaly: `Offaly County Development Plan 2021–2027. Key policies: Policy RH-1 (rural housing — moderate to supportive), Policy RH-2 (local rural need), Policy NH-1 (Slieve Bloom Mountains SPA, Bog of Allen). Offaly has a moderate approach to rural housing. Environmental sensitivities include NPWS-designated raised bogs (Natura 2000 network) and the Slieve Bloom uplands. The CDP has population retention policies for mid-county rural areas.`,

  Roscommon: `Roscommon County Development Plan 2022–2028. Key policies: Policy RH-1 (rural housing — broadly supportive), Policy RH-2 (local rural connection), Policy NH-1 (Lough Key Forest Park and river corridors). Roscommon is broadly supportive of rural housing given ongoing rural population decline. The county explicitly encourages returning emigrants and diaspora. Lakeshore and riverine development has additional amenity protection requirements.`,

  Sligo: `Sligo County Development Plan 2017–2023 (under review). Key policies: Policy RH-1 (rural housing — moderate approach), Policy RH-2 (local rural need), Policy NH-1 (Benbulbin, Glencar and Wild Atlantic Way landscape areas). Sligo applies moderate rural housing policies with heightened landscape sensitivity around Benbulbin, Knocknarea and the Yeats Country heritage landscape. The Wild Atlantic Way coastal zone requires careful siting and design.`,

  Tipperary: `Tipperary County Development Plan 2022–2028. Key policies: Policy RH-1 (rural housing — moderate local needs), Policy RH-2 (agricultural and occupational need), Policy NH-1 (Galtee Mountains, Slieveardagh Hills and Suir Valley). Tipperary applies a moderate local needs test. North Tipperary (Lough Derg and heritage towns) and the upland areas have enhanced landscape requirements. South Tipperary generally has a more permissive approach.`,

  Waterford: `Waterford City and County Development Plan 2022–2028. Key policies: Policy RH-1 (rural housing in county area — moderate needs test), Policy RH-2 (local rural connection), Policy NH-1 (Copper Coast UNESCO Geopark, Knockmealdown Mountains). Waterford City is governed by urban residential standards. The rural county is moderate with genuine local connection supporting most applications. The Copper Coast Geopark and Knockmealdown uplands have heightened landscape protection.`,

  Westmeath: `Westmeath County Development Plan 2021–2027. Key policies: Policy RH-1 (rural housing — moderate approach), Policy RH-2 (local needs), Policy NH-1 (Lough Ree and Lough Derravaragh lakeshore protections). Westmeath is moderately supportive of rural housing. Lakeshore development on Lough Ree, Lough Derravaragh and Lough Owel has strong amenity protection policies. The Athlone Greater Urban Area has a residential design-standards-based approach.`,

  Wexford: `Wexford County Development Plan 2021–2027. Key policies: Policy RH-1 (rural housing — moderate local needs), Policy RH-2 (agricultural or local occupational need), Policy NH-1 (Wexford Slobs and Harbour SPA, Hook Peninsula). Wexford applies a moderate local needs test. The Wexford Slobs internationally important bird habitat and Hook Head have stringent environmental restrictions. The county generally supports rural housing for applicants with genuine local connections.`,

  Wicklow: `Wicklow County Development Plan 2022–2028. Key policies: Policy RH-1 (rural housing — strict given Dublin MASP and AONB/ASAO coverage), Policy RH-2 (exceptional agricultural or social need), Policy NH-1 (Wicklow Mountains National Park, Glen of the Downs NHA, Vale of Avoca). Wicklow applies a strict local needs test as one of the most restricted counties due to its location in the Dublin Metropolitan Area Settlement Strategy and the exceptional landscape sensitivity of the Wicklow Mountains AONB. Agricultural need or demonstrated lifelong local connection is effectively required.`,
};

// ─── System prompt ────────────────────────────────────────────────────────────

const PLANNING_STATEMENT_SYSTEM_PROMPT = `You are an expert Irish planning consultant with 20 years of experience preparing planning statements for submission to Irish planning authorities. You have deep knowledge of:

- The Planning and Development Act 2000 (as amended), the Planning and Development Act 2024, and all relevant regulations
- The National Planning Framework (Project Ireland 2040) and the National Development Plan
- Regional Spatial and Economic Strategies (Eastern and Midland, Southern, Northern and Western)
- County Development Plans for all 26 Irish counties
- The Sustainable Rural Housing Guidelines for Planning Authorities (DoEHLG, 2005)
- The Urban Development and Building Heights Guidelines 2018
- Design guidance documents including the Urban Design Manual 2009
- Ministerial Guidelines under Section 28 of the Planning and Development Act

Your task is to write a professionally worded, comprehensive planning statement that:

1. Uses formal planning language appropriate for submission to an Irish planning authority
2. Correctly references the planning policy hierarchy (national → regional → local)
3. References specific county development plan policies provided in the user's input
4. Structures the document with clear numbered sections and subsections
5. Presents the development proposal in the most positive and policy-compliant light based on the information provided
6. For rural new builds, addresses local needs criteria under the Sustainable Rural Housing Guidelines 2005 and the relevant county CDP rural housing matrix
7. Addresses the proper planning and sustainable development of the area

FORMAT REQUIREMENTS:
- Use clear section headings formatted as "1. SECTION TITLE" (numbered, uppercase)
- Use subsection headings formatted as "1.1 Subsection Title"
- Write in formal third-person professional language
- Do not use bullet points in the main body — use full paragraphs
- Do not include a table of contents
- End with a clearly numbered Conclusion section
- Total length: approximately 800–1,200 words of substantive content
- Do not add any preamble before Section 1 or any commentary after the Conclusion

CRITICAL: You are generating a first draft for review. Do not overstate certainty — use language like "it is submitted that", "it is considered that", "the applicant is of the view that", "it is respectfully submitted".`;

// ─── Request interface ────────────────────────────────────────────────────────

interface PlanningStatementRequest {
  county: string;
  projectType: string;
  siteAddress: string;
  projectDescription: string;
  siteArea: string;
  proposedFloorArea: string;
  siteDescription: string;
  cdpCompliance: string;
  localNeeds: string;
  locationJustification: string;
  applicantName: string;
  agentName: string;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  let body: PlanningStatementRequest;
  try {
    body = await request.json() as PlanningStatementRequest;
  } catch {
    return badRequest("Invalid request body.");
  }

  const {
    county, projectType, siteAddress, projectDescription,
    siteArea, proposedFloorArea, siteDescription,
    cdpCompliance, localNeeds, locationJustification,
    applicantName, agentName,
  } = body;

  // Validate required fields
  const countyErr = validateCounty(county);
  if (countyErr) return badRequest(countyErr);

  if (!projectType || typeof projectType !== "string") return badRequest("Project type is required.");
  if (!siteAddress || typeof siteAddress !== "string" || !siteAddress.trim()) return badRequest("Site address is required.");
  if (!projectDescription || typeof projectDescription !== "string" || !projectDescription.trim()) return badRequest("Project description is required.");
  if (!siteDescription || typeof siteDescription !== "string" || !siteDescription.trim()) return badRequest("Site description is required.");
  if (!cdpCompliance || typeof cdpCompliance !== "string" || !cdpCompliance.trim()) return badRequest("County development plan compliance section is required.");
  if (!locationJustification || typeof locationJustification !== "string" || !locationJustification.trim()) return badRequest("Location justification is required.");

  const isRuralNewBuild = projectType === "new-build-rural";
  if (isRuralNewBuild && (!localNeeds || !localNeeds.trim())) {
    return badRequest("Local needs justification is required for rural new build applications.");
  }

  // Validate text areas
  for (const [field, value] of [
    ["Project description", projectDescription],
    ["Site description", siteDescription],
    ["CDP compliance", cdpCompliance],
    ["Local needs", localNeeds],
    ["Location justification", locationJustification],
  ] as [string, string][]) {
    const err = validateTextArea(value, field);
    if (err) return badRequest(err);
  }

  // Scan for injection
  const scanErr = scanFields(
    county, projectType, siteAddress, projectDescription, siteArea,
    proposedFloorArea, siteDescription, cdpCompliance, localNeeds,
    locationJustification, applicantName, agentName,
  );
  if (scanErr) return badRequest(scanErr);

  // CDP policy context for county
  const cdpContext = COUNTY_CDP_POLICIES[county] ?? `${county} County Development Plan. Please reference the current CDP policies for ${county} County Council.`;

  const projectTypeLabel: Record<string, string> = {
    "new-build-rural":  "New One-Off Rural Dwelling",
    "new-build-urban":  "New Dwelling (Urban/Suburban)",
    "extension":        "Extension or Alteration to Existing Dwelling",
    "replacement":      "Replacement Dwelling",
    "change-of-use":    "Change of Use",
    "retention":        "Retention of Unauthorised Development",
    "other":            "Other Development",
  };

  const userMessage = `Please write a professional planning statement for the following application:

APPLICANT: ${applicantName?.trim() || "The Applicant"}
AGENT / PLANNING CONSULTANT: ${agentName?.trim() || ""}
SITE ADDRESS: ${siteAddress.trim()}
COUNTY: ${county}
PROJECT TYPE: ${projectTypeLabel[projectType] ?? projectType}
${siteArea?.trim() ? `SITE AREA: ${siteArea.trim()}` : ""}
${proposedFloorArea?.trim() ? `PROPOSED FLOOR AREA: ${proposedFloorArea.trim()}` : ""}

DESCRIPTION OF PROPOSED DEVELOPMENT:
${projectDescription.trim()}

SITE DESCRIPTION AND CONTEXT:
${siteDescription.trim()}

COUNTY DEVELOPMENT PLAN COMPLIANCE (as provided by applicant/agent):
${cdpCompliance.trim()}

COUNTY DEVELOPMENT PLAN POLICY CONTEXT:
${cdpContext}
${isRuralNewBuild ? `
LOCAL NEEDS JUSTIFICATION (as provided by applicant):
${localNeeds.trim()}
` : ""}
WHY THIS LOCATION IS APPROPRIATE:
${locationJustification.trim()}

Generate a complete, professionally worded planning statement using the structure: 1. Introduction, 2. Site Location and Description, 3. Description of Proposed Development, 4. Planning Policy Framework, 5. Assessment Against Planning Policy${isRuralNewBuild ? ", 6. Local Needs Assessment, 7. Conclusion" : ", 6. Conclusion"}.`;

  try {
    const message = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 4096,
      system:     PLANNING_STATEMENT_SYSTEM_PROMPT,
      messages:   [{ role: "user", content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response from AI. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ statement: content.text });
  } catch (err) {
    console.error("Planning statement generation error:", err);
    return NextResponse.json({ error: "Failed to generate planning statement. Please try again." }, { status: 500 });
  }
}
