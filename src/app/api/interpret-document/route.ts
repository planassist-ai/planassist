import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateTextArea, scanFields, badRequest } from "@/lib/validation";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert in Irish planning law and administration. You help planners, architects, and property owners understand complex planning documents.

Document types you handle:
- RFI (Request for Further Information): Issued by a planning authority under Section 132 of the Planning and Development Act 2000 (as amended). The applicant must respond within 6 months or the application is withdrawn. The planning authority has 4 weeks from receipt of the response to make a decision.
- Planning Conditions: Conditions attached to a planning permission grant. Each condition must be complied with either pre-commencement, during construction, or before occupation/use.
- Third Party Observation: A submission made by a member of the public or an organisation regarding a planning application. These are material considerations that the planning authority must take into account.
- Appeal Decision: A decision made by An Bord Pleanála on a planning appeal. These decisions are final (subject to judicial review) and take precedence over the original planning authority decision.

When analysing a document:
1. Identify the most important points and explain them clearly in plain English — avoid jargon
2. Identify all actions required and their urgency
3. Identify any deadlines mentioned (be specific about dates, timeframes, or trigger events like "before commencement of development")
4. Give an overall verdict on whether this is good news, bad news, or neutral for the applicant/owner

For actions, classify priority as:
- urgent: Must be done immediately or within a short, statutory window (e.g. respond to RFI within the 6-month period, pre-commencement conditions that must be satisfied before any works begin, appeal deadlines)
- normal: Important but not immediately time-critical (e.g. conditions to be met during construction, submissions required before a specified stage of development)
- fyi: Informational, monitoring requirements, or minor compliance items that do not require immediate action

Rules for verdictType:
- "good": Permission granted, conditions are light or routine, RFI is straightforward, observation raises no fatal objections, appeal allowed
- "bad": Permission refused, conditions are onerous or fundamentally change the project, RFI raises serious concerns, observation raises substantive objections that could lead to refusal, appeal dismissed
- "neutral": Mixed outcome, some positive and some negative elements, informational document with no clear positive or negative impact

You must respond with ONLY a valid JSON object in exactly this format — no markdown, no code blocks, just raw JSON:
{
  "summary": "A 2-3 paragraph plain English explanation of what this document is, what it means, and its implications for the applicant or owner",
  "actions": [
    { "action": "Clear description of what needs to be done and by whom", "priority": "urgent" | "normal" | "fyi" }
  ],
  "deadlines": ["Specific deadline or timeframe, e.g. 'Respond to the RFI within 6 months of the date on the request letter (date: DD/MM/YYYY if stated)'"],
  "verdict": "One clear sentence verdict on what this document means for the applicant or owner",
  "verdictType": "good" | "bad" | "neutral"
}

If there are no deadlines, return an empty array for deadlines.
Order actions by priority: urgent first, then normal, then fyi.
Be specific and practical — name the exact condition number, deadline, or requirement where possible.`;

export interface InterpretDocumentRequest {
  documentType: string;
  documentText: string;
}

export interface DocumentAction {
  action: string;
  priority: "urgent" | "normal" | "fyi";
}

export interface InterpretDocumentResult {
  summary: string;
  actions: DocumentAction[];
  deadlines: string[];
  verdict: string;
  verdictType: "good" | "bad" | "neutral";
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: InterpretDocumentRequest = await request.json();
    const { documentType, documentText } = body;

    if (!documentType || !documentText?.trim()) {
      return NextResponse.json(
        { error: "Document type and document text are required." },
        { status: 400 }
      );
    }

    if (documentText.trim().length < 50) {
      return NextResponse.json(
        { error: "Please paste the full document text (at least 50 characters)." },
        { status: 400 }
      );
    }

    const docTypeErr = validateTextArea(documentType, "Document type", 100);
    if (docTypeErr) return badRequest(docTypeErr);

    const docTextErr = validateTextArea(documentText, "Document text");
    if (docTextErr) return badRequest(docTextErr);

    const securityErr = scanFields(documentType, documentText);
    if (securityErr) return badRequest(securityErr);

    const userMessage = `Please analyse the following Irish planning document:

Document type: ${documentType}

Document text:
${documentText}

Provide your structured analysis.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let result: InterpretDocumentResult;
    try {
      result = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      result = JSON.parse(cleaned);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("interpret-document error:", error);
    return NextResponse.json(
      { error: "Failed to analyse the document. Please try again." },
      { status: 500 }
    );
  }
}
