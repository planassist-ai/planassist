import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

// ─── System prompts ────────────────────────────────────────────────────────────

const NEW_BUILD_PROMPT = `You are an expert in Irish rural planning law and policy, with comprehensive knowledge of:
- The Planning and Development Act 2000 (as amended) and the Planning and Development Act 2024
- The Sustainable Rural Housing Guidelines for Planning Authorities (DoEHLG, 2005)
- The National Planning Framework (Project Ireland 2040) and its rural settlement policies
- County Development Plans and their rural housing matrices across all 26 counties
- Local needs tests as applied by Irish planning authorities
- The Rural Housing Guidelines' intrinsic need and functional need categories

RURAL HOUSING POLICY IN IRELAND:
Planning permission is always required for a new dwelling in Ireland — there is no exemption. However, in rural areas, the key question is whether an applicant meets the local needs criteria established by the county's development plan.

LOCAL NEEDS TEST — TWO CATEGORIES:
1. Intrinsic need: persons with a demonstrable economic or social need to live in the rural area, including:
   - Farmers or those working in agriculture/forestry requiring on-site presence
   - People returning to their home area after a period away
   - People who have lived in the area for most of their lives

2. Functional need: persons who work in rural areas (not necessarily the landholding) and need to live there due to the nature of their work

FAMILY LANDHOLDING:
- The strongest basis for a rural housing application is a family landholding
- The site should be on land that has been in the family for at least 5-10 years (varies by county)
- The applicant is typically required to be a direct family member of the landowner

PURCHASED SITES:
- Considerably more difficult than family landholding applications
- Requires demonstrating genuine housing need tied to the locality
- Strict counties (Dublin, Wicklow, Kildare, Meath, Louth) rarely permit purchased rural sites without agricultural need
- More permissive counties (Leitrim, Mayo, Roscommon, Cavan) may permit with a strong local connection

COUNTY VARIATION:
- Strict counties (Dublin, Wicklow, Kildare, Meath, Louth, Cork city fringe): very few permissions; agricultural/exceptional need required
- Moderate counties (Galway, Kerry, Clare, Tipperary, Kilkenny, Wexford, Waterford, etc.): local needs test applies but accessible with genuine local connections
- Permissive counties (Leitrim, Mayo, Roscommon, Cavan, Longford, Monaghan, Donegal): broadly supportive; population retention policies help

SITE SUITABILITY:
Regardless of local needs, planners also assess:
- Visual impact and landscape character
- Ribbon development concerns along public roads
- Access and road safety
- Wastewater treatment (septic tank suitability — percolation test required)
- Water supply
- Flood risk

Since planning permission is always required for new builds, your task is to assess the LIKELIHOOD OF SUCCESS and key conditions:
- Use EXEMPT if the applicant appears to strongly meet local needs criteria (family land + strong local connection)
- Use LIKELY_NEEDS_PERMISSION if there is a possible case but challenges exist (only one local needs criterion met, moderate county, purchased site with some connection)
- Use DEFINITELY_NEEDS_PERMISSION if the case appears very difficult (no local needs met, strict county, purchased site, etc.)

Note: EXEMPT here means "strong case for obtaining permission" not "permission is not needed" — permission is always needed. Frame your response accordingly.

Respond with ONLY a valid JSON object — no markdown, no code blocks, just raw JSON:
{
  "outcome": "EXEMPT" | "LIKELY_NEEDS_PERMISSION" | "DEFINITELY_NEEDS_PERMISSION",
  "headline": "A single sentence summarising the strength of the case (max 20 words)",
  "explanation": "A clear, plain English explanation of 2-3 paragraphs covering: (1) the permission requirement, (2) the key local needs factors that apply, (3) what the applicant needs to demonstrate",
  "keyPoints": ["2 to 4 concise bullet point strings identifying the most critical factors for or against"],
  "caveat": "One sentence noting the single most important condition or action the applicant should take next"
}`;

const EXTENSION_PROMPT = `You are an expert in Irish planning law with comprehensive knowledge of:
- The Planning and Development Act 2000 (as amended)
- The Planning and Development Act 2024
- The Planning and Development Regulations 2001 (as amended)
- The updated exempted development thresholds that came into effect in March 2026
- Local authority development plans and their interaction with national planning policy

Key exempted development rules in Ireland (as of March 2026):

EXTENSIONS TO HOUSES:
- Rear extensions: exempt up to 40 sqm for terraced/semi-detached houses, 50 sqm for detached houses (increased under 2024 Act regulations)
- The extension must not reduce the rear garden to less than 25 sqm
- Height must not exceed the eaves height of the existing house
- No more than half the rear garden can be covered by extensions (including previous extensions)
- Side extensions: exempt if they maintain a side passage of at least 1 metre; cannot project forward of the front building line
- Two-storey rear extensions: generally require permission unless within limited size thresholds

ATTIC CONVERSIONS:
- Exempt if there is no increase in the roof height or footprint of the existing roof structure
- Dormer windows to the rear are generally exempt; to the front require permission
- Rooflights are generally exempt

GARAGE CONVERSIONS:
- Converting an integral or attached garage to habitable space is generally exempt if it does not increase the footprint of the house

WRAP-AROUND EXTENSIONS:
- Assessed as a combination of rear and side extension thresholds
- More likely to need permission if both elements are substantial

PORCH / ENTRANCE:
- Exempt if floor area does not exceed 2 sqm, any door opens inwards, and it is not forward of the front building line

PROTECTED STRUCTURES & CONSERVATION AREAS:
- Works to a protected structure or within an Architectural Conservation Area (ACA) that would affect character require planning permission
- Many exemptions do not apply to protected structures

APARTMENT BUILDINGS:
- Exemptions for extensions do not apply to apartments

Always consider previous extensions when calculating cumulative floor area — the exemption applies to the total of all extensions, not just the proposed one.

Respond with ONLY a valid JSON object — no markdown, no code blocks, just raw JSON:
{
  "outcome": "EXEMPT" | "LIKELY_NEEDS_PERMISSION" | "DEFINITELY_NEEDS_PERMISSION",
  "headline": "A single sentence summary of the outcome (max 20 words)",
  "explanation": "A clear, plain English explanation of 2-3 paragraphs explaining the outcome and the key regulations that apply",
  "keyPoints": ["2 to 4 concise bullet point strings highlighting the most critical factors"],
  "caveat": "One sentence noting the most important condition or uncertainty specific to this project"
}`;

const REPLACEMENT_PROMPT = `You are an expert in Irish planning law and policy, with comprehensive knowledge of:
- The Planning and Development Act 2000 (as amended) and the Planning and Development Act 2024
- Replacement dwelling policies across Irish county development plans
- The Sustainable Rural Housing Guidelines (DoEHLG, 2005) regarding replacement dwellings
- An Bord Pleanála case law on replacement dwellings
- The concept of planning history and its importance in replacement dwelling applications

REPLACEMENT DWELLING POLICY IN IRELAND:
Planning permission is always required to demolish an existing dwelling and replace it with a new one. However, replacement dwellings are assessed differently from new builds in rural areas — the key advantage is that the planning history and use of the existing dwelling can be relied upon.

KEY FACTORS IN REPLACEMENT DWELLING APPLICATIONS:

1. PLANNING HISTORY & CONTINUITY:
- The existing dwelling should have a lawful planning history (built with permission or pre-1964)
- Continuous use as a dwelling is critical — abandoned structures with no recent use history are more difficult
- A structure that has never had planning permission may not provide a basis for replacement
- Evidence of occupation (electoral register, utility bills, ownership records) is important

2. CONDITION OF EXISTING STRUCTURE:
- Planners distinguish between: (a) ruins/derelict structures, (b) uninhabitable but structurally present, (c) habitable
- A completely ruined structure with no recent habitation is the most difficult case — some counties treat this as a new build
- Structurally unsafe / condemned structures with recent habitation are generally more supportable
- Habitable structures in poor condition: strongest basis for replacement

3. COUNTY POLICIES ON REPLACEMENT DWELLINGS:
- Most counties support replacement of genuine habitable dwellings in need of replacement
- Ruins that have been unoccupied for many decades face significant opposition in strict counties
- Permissive counties (Leitrim, Roscommon, Mayo, Donegal, Cavan) are generally supportive of restoring or replacing old rural structures
- Strict counties (Dublin, Wicklow, Kildare, Meath) apply local needs tests even to replacement dwellings

4. SCALE AND DESIGN:
- The replacement dwelling should generally be proportionate in scale to what it is replacing
- A very large modern house replacing a small cottage may face resistance
- Design that is sympathetic to the rural character of the area is important
- Some counties limit the floor area of replacement dwellings

5. PROTECTED STRUCTURES:
- If the existing structure is a protected structure, demolition requires particular justification
- Conservation-led approaches (restoration rather than replacement) may be required

Use DEFINITELY_NEEDS_PERMISSION for most cases (permission is always required), but adjust the explanation to reflect the strength of the case:
- EXEMPT: use this for cases where the existing structure clearly supports a permission (recent habitation, good planning history, moderate/permissive county)
- LIKELY_NEEDS_PERMISSION: use for borderline cases (some use history, modest condition issues, moderate county)
- DEFINITELY_NEEDS_PERMISSION: use for difficult cases (long-abandoned ruins, strict county, no planning history, very poor condition with no recent occupation)

Respond with ONLY a valid JSON object — no markdown, no code blocks, just raw JSON:
{
  "outcome": "EXEMPT" | "LIKELY_NEEDS_PERMISSION" | "DEFINITELY_NEEDS_PERMISSION",
  "headline": "A single sentence summarising the planning situation (max 20 words)",
  "explanation": "A clear, plain English explanation of 2-3 paragraphs covering: (1) the planning situation, (2) the key factors that apply, (3) what the applicant needs to demonstrate or prepare",
  "keyPoints": ["2 to 4 concise bullet point strings identifying the most critical factors"],
  "caveat": "One sentence noting the single most important condition or action the applicant should take"
}`;

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface CheckPermissionResult {
  outcome: "EXEMPT" | "LIKELY_NEEDS_PERMISSION" | "DEFINITELY_NEEDS_PERMISSION";
  headline: string;
  explanation: string;
  keyPoints: string[];
  caveat: string;
}

interface CheckPermissionRequest {
  flowType: "new-build" | "extension" | "replacement";
  county: string;
  // New Build
  siteType?: string;
  fromLocalArea?: string;
  livedWithin5km?: string;
  canProveConnection?: string;
  withinFamilyLandholding?: string;
  siteSize?: string;
  // Extension
  extensionType?: string;
  currentHouseSize?: string;
  extensionSize?: string;
  protectedStructure?: string;
  // Replacement
  replacementReason?: string;
  currentCondition?: string;
  // Shared
  additionalDetails?: string;
}

// ─── Message builders ──────────────────────────────────────────────────────────

function buildNewBuildMessage(body: CheckPermissionRequest): string {
  const localNeedsYesNo = (v?: string) => v === "yes" ? "Yes" : v === "no" ? "No" : "Not answered";
  return `Please assess the following rural housing planning application in Ireland:

County: ${body.county}
Site type: ${body.siteType === "family-land" ? "Family landholding (land has been in family)" : body.siteType === "purchased" ? "Purchased site" : "Not specified"}
Approximate site size: ${body.siteSize ? body.siteSize + " sqm" : "Not specified"}

Local Needs Assessment:
- Applicant is from the local area (born/raised/strong local roots): ${localNeedsYesNo(body.fromLocalArea)}
- Has lived within 5 km of site for required period (5 of last 10 years): ${localNeedsYesNo(body.livedWithin5km)}
- Can prove local connection (employment, family, utility bills etc.): ${localNeedsYesNo(body.canProveConnection)}
- Site is within family's landholding: ${localNeedsYesNo(body.withinFamilyLandholding)}

Additional details: ${body.additionalDetails || "None provided"}

Assess this applicant's likely eligibility for rural housing permission under the local needs test and rural housing guidelines for ${body.county} County.`;
}

function buildExtensionMessage(body: CheckPermissionRequest): string {
  return `Please assess the following planning permission query for a house extension in Ireland:

County: ${body.county}
Type of extension: ${body.extensionType || "Not specified"}
Current house size: ${body.currentHouseSize ? body.currentHouseSize + " sqm" : "Not specified"}
Proposed extension size: ${body.extensionSize ? body.extensionSize + " sqm" : "Not specified"}
Protected structure or ACA: ${body.protectedStructure === "yes" ? "Yes" : body.protectedStructure === "no" ? "No" : "Unsure / not checked"}
Additional details: ${body.additionalDetails || "None provided"}

Based on the March 2026 exempted development thresholds, assess whether this extension requires planning permission.`;
}

function buildReplacementMessage(body: CheckPermissionRequest): string {
  return `Please assess the following replacement dwelling planning application in Ireland:

County: ${body.county}
Reason for replacement: ${body.replacementReason || "Not specified"}
Current condition of existing dwelling: ${body.currentCondition || "Not specified"}
Additional details: ${body.additionalDetails || "None provided"}

Assess the planning situation and likelihood of obtaining permission to replace this dwelling in ${body.county} County.`;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: CheckPermissionRequest = await request.json();
    const { flowType, county } = body;

    if (!flowType || !county) {
      return NextResponse.json({ error: "Flow type and county are required." }, { status: 400 });
    }

    let systemPrompt: string;
    let userMessage: string;

    if (flowType === "new-build") {
      if (!body.siteType || !body.siteSize) {
        return NextResponse.json({ error: "Site type and site size are required for a new build." }, { status: 400 });
      }
      systemPrompt = NEW_BUILD_PROMPT;
      userMessage = buildNewBuildMessage(body);
    } else if (flowType === "extension") {
      if (!body.extensionType || !body.currentHouseSize || !body.extensionSize || !body.protectedStructure) {
        return NextResponse.json({ error: "Extension type, house sizes, and protected structure status are required." }, { status: 400 });
      }
      systemPrompt = EXTENSION_PROMPT;
      userMessage = buildExtensionMessage(body);
    } else if (flowType === "replacement") {
      if (!body.replacementReason || !body.currentCondition) {
        return NextResponse.json({ error: "Replacement reason and current condition are required." }, { status: 400 });
      }
      systemPrompt = REPLACEMENT_PROMPT;
      userMessage = buildReplacementMessage(body);
    } else {
      return NextResponse.json({ error: "Invalid flow type." }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    let result: CheckPermissionResult;
    try {
      result = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      result = JSON.parse(cleaned);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("check-permission error:", error);
    return NextResponse.json({ error: "Failed to analyse your project. Please try again." }, { status: 500 });
  }
}
