"use client";

import { useState } from "react";

interface Template {
  id: string;
  category: string;
  title: string;
  subject: string;
  body: string;
}

const TEMPLATES: Template[] = [
  {
    id: "rfi-receipt",
    category: "RFI / Further Information",
    title: "RFI Receipt Acknowledgement",
    subject: "Re: Request for Further Information — [Planning Reference]",
    body: `Dear [Council Contact],

Thank you for your Request for Further Information dated [RFI Date] regarding planning application reference [Planning Reference] for [Project Description] at [Site Address].

We acknowledge receipt of the RFI and confirm we are reviewing the items raised. We will endeavour to respond within the statutory 6-month period.

We will be in contact if we require any clarification on the information requested.

Yours sincerely,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "rfi-response-cover",
    category: "RFI / Further Information",
    title: "RFI Response Cover Letter",
    subject: "Response to Request for Further Information — [Planning Reference]",
    body: `Dear [Council Contact],

Planning Application Reference: [Planning Reference]
Site Address: [Site Address]

Please find enclosed our response to the Request for Further Information issued by [Council Name] on [RFI Date].

The following documents are submitted in response:

1. [Document 1 — e.g., Revised Site Layout Drawing]
2. [Document 2 — e.g., Drainage Report]
3. [Document 3 — e.g., Amended Elevations]
4. Cover letter addressing each item raised

We trust that the information provided is sufficient to allow the planning authority to proceed to a determination. Please do not hesitate to contact us should you require any further clarification.

Yours sincerely,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "client-submission",
    category: "Client Updates",
    title: "Application Submitted Notification",
    subject: "Planning Application Submitted — [Planning Reference]",
    body: `Dear [Client Name],

I am pleased to confirm that your planning application has been submitted to [Council Name] and has been assigned the following reference number:

Planning Reference: [Planning Reference]

The application is for [Brief Description of Development] at [Site Address].

Key dates:
• Submission date: [Submission Date]
• Statutory decision date: [Decision Date — 8 weeks from validation]

What happens next:
1. The council will validate the application, typically within 2–3 weeks.
2. A site notice must be erected and a newspaper notice published within 2 weeks of submission.
3. The application will be publicly advertised and open for third-party observations for 5 weeks.
4. The council may issue a Request for Further Information if additional details are required.
5. A decision is expected within 8 weeks of validation.

I will keep you updated on any significant developments.

Kind regards,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "client-decision-granted",
    category: "Client Updates",
    title: "Planning Permission Granted",
    subject: "Great News — Planning Permission Granted — [Planning Reference]",
    body: `Dear [Client Name],

I am delighted to inform you that planning permission has been granted for your development at [Site Address].

Planning Reference: [Planning Reference]
Decision Date: [Decision Date]
Decision: Permission Granted

The permission is subject to [X] conditions which I have reviewed and summarised below:

[Brief summary of key conditions — e.g., commencement notice, material finishes, landscaping]

Important next steps:
• The permission is valid for 5 years from the date of grant.
• If any third parties made observations, they have 4 weeks from the decision date to lodge an appeal with An Bord Pleanála.
• Once the appeal period has lapsed, you are free to commence works subject to complying with the attached conditions.

I will forward you a copy of the full grant document for your records.

Kind regards,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "client-decision-refused",
    category: "Client Updates",
    title: "Planning Permission Refused",
    subject: "Planning Decision — [Planning Reference]",
    body: `Dear [Client Name],

I regret to inform you that planning permission has been refused for the development at [Site Address].

Planning Reference: [Planning Reference]
Decision Date: [Decision Date]
Decision: Permission Refused

The reasons for refusal were as follows:
1. [Reason 1]
2. [Reason 2]

Next steps and options:
• You have 4 weeks from the decision date to lodge an appeal with An Bord Pleanála.
• Alternatively, we could consider submitting a revised application that addresses the council's concerns.
• I am happy to meet with you to discuss the decision in detail and advise on the best course of action.

Kind regards,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "client-rfi-received",
    category: "Client Updates",
    title: "RFI Received — Client Notification",
    subject: "Request for Further Information — Action Required — [Planning Reference]",
    body: `Dear [Client Name],

I am writing to let you know that [Council Name] has issued a Request for Further Information (RFI) in respect of your planning application.

Planning Reference: [Planning Reference]
RFI Date: [RFI Date]
Response Deadline: [Deadline — 6 months from RFI date]

The council has requested the following additional information:
• [Item 1]
• [Item 2]
• [Item 3]

This is a routine part of the planning process and does not indicate that the application will be refused. I will prepare a comprehensive response addressing each item raised.

Could you please revert to me at your earliest convenience so we can ensure a timely response?

Kind regards,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "pre-application",
    category: "Pre-Application",
    title: "Pre-Application Consultation Request",
    subject: "Pre-Application Consultation Request — [Site Address]",
    body: `Dear Planning Department,

I am writing on behalf of [Client Name] to request a pre-application consultation in relation to a proposed development at [Site Address].

Nature of proposed development:
[Brief description of proposed works]

Key issues on which guidance is sought:
1. [Issue 1 — e.g., Acceptability of proposed footprint and height]
2. [Issue 2 — e.g., Flood risk assessment requirements]
3. [Issue 3 — e.g., Requirements for traffic/mobility statement]

I am available for a meeting at your convenience and can provide preliminary drawings if helpful.

Yours sincerely,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "neighbour-notification",
    category: "Notifications",
    title: "Neighbour Notification Letter",
    subject: "Notice of Proposed Planning Application — [Site Address]",
    body: `Dear Neighbour,

I am writing on behalf of [Client Name] to inform you of a planning application we are preparing in relation to the property at [Site Address].

Nature of proposed works:
[Description of development]

We are in the process of preparing the planning application and intend to submit it to [Council Name] in the coming weeks. As part of the process, a site notice will be erected and a public notice published in a local newspaper.

We are reaching out in advance to make you aware of the proposal and to offer an opportunity to view the plans. Formal planning observations can be submitted directly to [Council Name] within 5 weeks of the application being publicly advertised.

Kind regards,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "appeal-lodgement",
    category: "Appeals",
    title: "Appeal Lodgement — Client Notification",
    subject: "An Bord Pleanála Appeal Lodged — [Planning Reference]",
    body: `Dear [Client Name],

I am writing to confirm that an appeal has been lodged with An Bord Pleanála in respect of the planning authority's decision on your application.

Planning Reference: [Planning Reference]
ABP Reference: [ABP Reference — if known]
Appeal Lodged: [Date]

What happens next:
1. An Bord Pleanála will acknowledge the appeal and notify all parties.
2. The planning authority will submit a copy of the planning file to ABP.
3. There may be an opportunity to submit observations or a response to the appeal grounds.
4. ABP aims to decide most appeals within 18 weeks.

I will monitor the appeal and keep you fully informed of developments.

Kind regards,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
  {
    id: "fee-proposal",
    category: "Practice Management",
    title: "Professional Fee Proposal",
    subject: "Fee Proposal — Architectural Services — [Project Description]",
    body: `Dear [Client Name],

Thank you for the opportunity to submit a fee proposal for architectural services in connection with the proposed development at [Site Address].

Scope of Services:
Stage 1 — Appraisal and briefing
Stage 2 — Concept design and pre-application consultation
Stage 3 — Planning application preparation and submission
Stage 4 — Response to further information (if required)
Stage 5 — Post-permission queries and discharge of conditions

Fee Proposal:
Our professional fee for the above scope of services is [€X,XXX] + VAT at 23%.

Planning application fees, newspaper notice costs, and third-party survey costs are not included and will be charged at cost.

Payment Terms:
• [X]% on instruction
• [X]% on submission of planning application
• [X]% on receipt of decision

This proposal is valid for 30 days from the date of this letter.

Yours sincerely,

[Your Name]
[Practice Name]
[Email] | [Phone]`,
  },
];

const CATEGORIES = Array.from(new Set(TEMPLATES.map(t => t.category)));

export default function EmailTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  const filtered = selectedCategory === "All"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  function copy(type: "subject" | "body") {
    if (!selectedTemplate) return;
    const text = type === "subject" ? selectedTemplate.subject : selectedTemplate.body;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pre-written templates for common architect communications. Click any template to preview and copy.
        </p>
      </div>

      <div className="flex gap-6" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
        {/* Left panel */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {["All", ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  selectedCategory === cat
                    ? "bg-blue-700 border-blue-700 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filtered.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={[
                  "w-full text-left px-3.5 py-3 rounded-xl border transition-all",
                  selectedTemplate?.id === t.id
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:border-gray-300",
                ].join(" ")}
              >
                <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${selectedTemplate?.id === t.id ? "text-blue-600" : "text-gray-400"}`}>
                  {t.category}
                </p>
                <p className={`text-sm font-medium leading-snug ${selectedTemplate?.id === t.id ? "text-blue-900" : "text-gray-800"}`}>
                  {t.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {selectedTemplate ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-0.5">{selectedTemplate.category}</p>
                  <h2 className="text-base font-semibold text-gray-900">{selectedTemplate.title}</h2>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => copy("subject")}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    {copied === "subject" ? "Copied!" : "Copy Subject"}
                  </button>
                  <button
                    onClick={() => copy("body")}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors"
                  >
                    {copied === "body" ? "Copied!" : "Copy Body"}
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">Subject line</p>
                <p className="text-sm font-medium text-gray-800">{selectedTemplate.subject}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedTemplate.body}
                </pre>
              </div>

              <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
                <p className="text-xs text-amber-700">
                  Replace all <span className="font-mono bg-amber-100 px-1 rounded">[bracketed placeholders]</span> before sending.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Select a template</p>
                <p className="text-xs text-gray-400 mt-1">Choose from the list on the left to preview and copy</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
