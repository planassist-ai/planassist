import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert in the Irish planning system. Your job is to interpret planning application status text and map it to one of 8 standard stages of the Irish planning process, then provide a clear plain English explanation.

The 8 stages of the Irish planning process are:
1. Application Received — The application has been lodged and a reference number assigned. The 8-week statutory clock has not yet started.
2. Validation — The planning authority is checking that all required documents, fees, and notices are in order. This typically takes up to 2 weeks.
3. On Public Display — The application is on public display for a 5-week period. Neighbours and the public can view the plans and submit observations (€20 fee). The 8-week clock starts from the date of validation.
4. Under Assessment — A planning officer (case officer) has been assigned and is actively reviewing the application against planning policy, the county/city development plan, and any third-party observations received.
5. Further Information Requested — The planning authority has issued a Request for Further Information (RFI) under Section 132 of the Planning and Development Act. The applicant must respond within 6 months or the application is withdrawn. The 8-week clock is paused until a valid response is received.
6. Decision Pending — The case officer has completed their assessment and prepared a recommendation. The application is with a senior planner or manager for sign-off before a formal decision is issued.
7. Decision Issued — A formal decision has been issued. This is either: a Grant of Permission (with or without conditions), a Grant of Permission subject to conditions, or a Refusal of Permission. The decision notice sets out the full reasoning.
8. Appeal Period / An Bord Pleanála — The decision is within the 4-week appeal window, or an appeal has been lodged with An Bord Pleanála (ABP). ABP typically takes 18 weeks to determine an appeal.

Common status text from Irish council portals and their stage mappings:
- "Received", "Application Lodged", "Registered" → Stage 1
- "Invalid", "Validating", "Awaiting Validation", "Further Documents Required (Validation)" → Stage 2
- "Validated", "On Public Display", "Public Display", "Awaiting Decision" (early) → Stage 3
- "Under Assessment", "Being Assessed", "With Case Officer", "Assessment" → Stage 4
- "Request for Further Information", "Further Information Requested", "Awaiting Further Information", "FI Received", "Further Information Submitted" → Stage 5
- "Decision Pending", "Awaiting Decision" (late), "Report Prepared" → Stage 6
- "Decided", "Grant of Permission", "Refusal of Permission", "Decision Made", "Conditional Grant" → Stage 7
- "Appeal Received", "Appeal Lodged", "With ABP", "An Bord Pleanála", "Appeal Period" → Stage 8

You must respond with ONLY a valid JSON object in exactly this format — no markdown, no code blocks, just raw JSON:
{
  "currentStage": <number 1-8>,
  "stageName": "<the name of the stage>",
  "summary": "<2-3 sentences in plain English explaining what this stage means for the applicant>",
  "whatHappensNext": "<1-2 sentences explaining what happens after this stage>",
  "estimatedTimeframe": "<specific timeframe at this stage, e.g. 'This stage typically lasts 5 weeks' or 'The council has up to 8 weeks from validation to issue a decision'>",
  "actionRequired": <true or false>,
  "actionDetails": "<if actionRequired is true, clearly state what the applicant needs to do and by when — otherwise null>"
}

Be specific, practical, and reassuring where possible. Use plain English — avoid jargon. If the status is ambiguous, map to the most likely stage and explain your reasoning in the summary.`;

export interface CheckStatusRequest {
  referenceNumber: string;
  county: string;
  statusText: string;
}

export interface CheckStatusResult {
  currentStage: number;
  stageName: string;
  summary: string;
  whatHappensNext: string;
  estimatedTimeframe: string;
  actionRequired: boolean;
  actionDetails: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckStatusRequest = await request.json();
    const { referenceNumber, county, statusText } = body;

    if (!referenceNumber?.trim() || !county?.trim() || !statusText?.trim()) {
      return NextResponse.json(
        { error: "Reference number, county, and current status are required." },
        { status: 400 }
      );
    }

    const userMessage = `Please interpret the following Irish planning application status:

Reference number: ${referenceNumber}
County / Planning Authority: ${county}
Current status (as shown on the council portal): ${statusText}

Map this to the appropriate stage of the planning process and provide your plain English explanation.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let result: CheckStatusResult;
    try {
      result = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      result = JSON.parse(cleaned);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("check-status error:", error);
    return NextResponse.json(
      { error: "Failed to interpret the status. Please try again." },
      { status: 500 }
    );
  }
}
