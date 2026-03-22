import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert in Irish planning law with comprehensive knowledge of:
- The Planning and Development Act 2000 (as amended)
- The Planning and Development Act 2024
- The Planning and Development Regulations 2001 (as amended)
- The updated exempted development thresholds that came into effect in March 2026
- Local authority development plans and their interaction with national planning policy

Key exempted development rules in Ireland (as of March 2026):

EXTENSIONS TO HOUSES:
- Rear extensions: exempt up to 40 sqm for terraced/semi-detached houses, 50 sqm for detached houses (increased under 2024 Act regulations)
- The extension must not reduce the rear garden to less than 25 sqm
- Height of extension must not exceed the eaves height of the existing house
- No more than half the rear garden can be covered by extensions (including previous extensions)
- Side extensions: exempt if they maintain a side passage of at least 1 metre; cannot project forward of the front building line

ATTIC CONVERSIONS:
- Exempt if there is no increase in the roof height or footprint of the existing roof structure
- Dormer windows to the rear are generally exempt; to the front require permission
- Rooflights are generally exempt

GARDEN ROOMS / OUTBUILDINGS / SHEDS:
- Exempt if total floor area does not exceed 25 sqm
- Must not be used for human habitation
- Must not be forward of the front building line
- Must be incidental to the enjoyment of the dwelling

GARAGE CONVERSIONS:
- Converting an integral or attached garage to habitable space is generally exempt if it does not increase the footprint of the house

SOLAR PANELS:
- Exempt on dwellings under expanded 2024 Act provisions

NEW BUILDS:
- Always require planning permission — there is no exemption for a new dwelling

CHANGE OF USE:
- Almost always requires planning permission unless the change is between uses within the same use class
- Converting a commercial property to residential requires planning permission
- Converting a single dwelling to multiple units requires planning permission

PROTECTED STRUCTURES & CONSERVATION AREAS:
- Works to a protected structure or within an Architectural Conservation Area (ACA) that would affect character require planning permission and potentially a conservation architect
- Many exemptions do not apply to protected structures

APARTMENT BUILDINGS & FLATS:
- Exemptions for extensions do not apply to apartments

Always consider:
1. Whether the property might be a protected structure (particularly in Dublin, Cork, Galway cities and historic towns)
2. Whether the site is in a flood risk zone (relevant in counties like Galway, Leitrim, Roscommon, Cork)
3. County-specific considerations (e.g. Dublin City Council, Cork City Council have specific local area plan policies)
4. Whether previous extensions may have used up the permitted exemption allowance

You must respond with ONLY a valid JSON object in exactly this format — no markdown, no code blocks, just raw JSON:
{
  "outcome": "EXEMPT" | "LIKELY_NEEDS_PERMISSION" | "DEFINITELY_NEEDS_PERMISSION",
  "headline": "A single sentence summary of the outcome (max 20 words)",
  "explanation": "A clear, plain English explanation of 2-3 paragraphs explaining the outcome and the key regulations that apply",
  "keyPoints": ["2 to 4 concise bullet point strings highlighting the most critical factors"],
  "caveat": "One sentence noting the most important condition or uncertainty specific to this project"
}

Use EXEMPT when the project clearly falls within exempted development thresholds.
Use LIKELY_NEEDS_PERMISSION when the project is borderline, depends on conditions not provided, or has risk factors that could remove the exemption.
Use DEFINITELY_NEEDS_PERMISSION when the project clearly exceeds exemption thresholds or is a type that always requires permission.`;

export interface CheckPermissionRequest {
  county: string;
  projectType: string;
  size: number;
  details: string;
}

export interface CheckPermissionResult {
  outcome: "EXEMPT" | "LIKELY_NEEDS_PERMISSION" | "DEFINITELY_NEEDS_PERMISSION";
  headline: string;
  explanation: string;
  keyPoints: string[];
  caveat: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPermissionRequest = await request.json();
    const { county, projectType, size, details } = body;

    if (!county || !projectType || !size) {
      return NextResponse.json(
        { error: "County, project type, and size are required." },
        { status: 400 }
      );
    }

    const userMessage = `Please assess the following planning permission query for a project in Ireland:

County: ${county}
Project type: ${projectType}
Size: ${size} square metres
Additional details: ${details || "None provided"}

Based on this information, classify the project and provide your assessment.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let result: CheckPermissionResult;
    try {
      result = JSON.parse(rawText);
    } catch {
      // If Claude wrapped in markdown code fences, strip them
      const cleaned = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      result = JSON.parse(cleaned);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("check-permission error:", error);
    return NextResponse.json(
      { error: "Failed to analyse your project. Please try again." },
      { status: 500 }
    );
  }
}
