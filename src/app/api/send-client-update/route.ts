import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  validatePlanningRef,
  validateTextArea,
  scanFields,
  badRequest,
} from "@/lib/validation";
import { resolveUserTier, unauthorized, architectOnly } from "@/lib/authGuard";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend    = new Resend(process.env.RESEND_API_KEY);

const STATUS_LABELS: Record<string, string> = {
  received:         "Received",
  validation:       "In Validation",
  on_display:       "On Public Display",
  under_assessment: "Under Assessment",
  further_info:     "Further Information Required",
  decision_pending: "Decision Pending",
  granted:          "Granted",
  refused:          "Refused",
  appeal:           "Under Appeal",
};

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isArchitect) return architectOnly();


  try {
    const {
      referenceNumber,
      clientName,
      clientEmail,
      propertyAddress,
      projectDescription,
      status,
      submissionDate,
      statutoryDeadline,
      hasRFI,
      rfiIssuedDate,
      decisionDate,
    } = await request.json();

    if (!referenceNumber?.trim() || !clientEmail?.trim()) {
      return NextResponse.json(
        { error: "referenceNumber and clientEmail are required." },
        { status: 400 }
      );
    }

    const refErr = validatePlanningRef(referenceNumber);
    if (refErr) return badRequest(refErr);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail.trim())) {
      return badRequest("Please enter a valid email address for the client.");
    }

    const nameErr = validateTextArea(clientName, "Client name", 100);
    if (nameErr) return badRequest(nameErr);

    const addrErr = validateTextArea(propertyAddress, "Property address", 200);
    if (addrErr) return badRequest(addrErr);

    const projErr = validateTextArea(projectDescription, "Project description", 500);
    if (projErr) return badRequest(projErr);

    const securityErr = scanFields(clientName, propertyAddress, projectDescription);
    if (securityErr) return badRequest(securityErr);

    const statusLabel    = STATUS_LABELS[status] ?? status;
    const deadlineDate   = new Date(statutoryDeadline).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
    const submissionFmt  = new Date(submissionDate).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
    const decisionFmt    = decisionDate
      ? new Date(decisionDate).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })
      : null;
    const rfiDateFmt     = rfiIssuedDate
      ? new Date(rfiIssuedDate).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })
      : null;

    const context = `
Planning application reference: ${referenceNumber}
Client name: ${clientName}
Property: ${propertyAddress}
Project: ${projectDescription}
Current status: ${statusLabel}
Submitted: ${submissionFmt}
Statutory decision deadline: ${deadlineDate}
${hasRFI && rfiDateFmt ? `Further Information Request (RFI) issued on ${rfiDateFmt} — awaiting client response.` : ""}
${decisionFmt ? `Decision issued on ${decisionFmt}.` : ""}
    `.trim();

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `You are an architect writing a short client update email about an Irish planning application.

Write a friendly, plain-English email to the client. The email should:
- Open with a brief greeting using the client's first name only
- Explain clearly what the current status means in simple language (avoid technical jargon)
- Mention the relevant dates (submission date, deadline, or decision date as appropriate)
- If there is an RFI outstanding, clearly explain what that means and that action is needed
- End with a reassuring closing line and offer to answer any questions
- Be warm but professional — like a trusted professional updating a friend
- Be concise — around 120–160 words

Do NOT include a subject line, signature, or formatting. Output only the email body text.

Application details:
${context}`,
        },
      ],
    });

    const emailBody =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!emailBody) {
      return NextResponse.json({ error: "Failed to generate email content." }, { status: 500 });
    }

    const firstName = clientName.split(/[\s,&]/)[0] ?? clientName;
    const subject   = `Update on your planning application — ${referenceNumber}`;

    const { error: sendError } = await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? "Granted <hello@granted.ie>",
      to:      clientEmail.trim(),
      subject,
      text:    emailBody,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ sent: true, to: clientEmail.trim(), firstName });
  } catch (err) {
    console.error("send-client-update unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
