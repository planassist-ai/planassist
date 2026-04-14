"use client";

import { useState } from "react";
import { DashboardShell } from "@/app/components/DashboardShell";

interface EmailTemplate {
  id: string;
  title: string;
  situation: string;
  subject: string;
  body: string;
  category: "submission" | "rfi" | "decision" | "appeal" | "general";
}

const TEMPLATES: EmailTemplate[] = [
  {
    id: "submitted",
    title: "Application Submitted",
    situation: "Send to client immediately after lodging their planning application",
    category: "submission",
    subject: "Your Planning Application Has Been Submitted — [Reference Number]",
    body: `Dear [Client Name],

I am pleased to confirm that your planning application has been formally submitted to [Council Name].

Planning Reference: [Reference Number]
Property: [Property Address]
Date Submitted: [Submission Date]

What happens next:

The planning authority will now validate your application, which typically takes 5–10 working days. Once validated, the application will go on public display for 5 weeks during which third parties can make observations.

Your statutory decision date is [Decision Deadline] — this is the date by which the council must issue a decision.

I will keep you updated at each key stage. In the meantime, if you have any questions please do not hesitate to contact me.

Kind regards,
[Your Name]
[Practice Name]
[Phone Number]`,
  },
  {
    id: "rfi_received",
    title: "RFI Received from Council",
    situation: "Notify client when a Further Information request is issued",
    category: "rfi",
    subject: "Action Required: Further Information Requested — [Reference Number]",
    body: `Dear [Client Name],

I am writing to let you know that [Council Name] has issued a Further Information (FI) request on your planning application.

Planning Reference: [Reference Number]
Date of FI Request: [RFI Date]
Response Deadline: [Response Deadline]

What this means:

The council requires additional information or clarification before they can make a decision. This is common and does not mean your application is in difficulty. Once we submit a satisfactory response, the council's clock effectively resets and they will have a further period to make a decision.

I have reviewed the FI request and [briefly describe what is needed]. I will prepare the necessary response on your behalf.

I will need [list any items you need from the client, if applicable] from you by [date] to ensure we respond within the deadline.

Please call me if you would like to discuss further.

Kind regards,
[Your Name]
[Practice Name]
[Phone Number]`,
  },
  {
    id: "decision_granted",
    title: "Planning Permission Granted",
    situation: "Send to client when permission is granted",
    category: "decision",
    subject: "Planning Permission Granted — [Reference Number]",
    body: `Dear [Client Name],

I am delighted to inform you that [Council Name] has granted planning permission for your application.

Planning Reference: [Reference Number]
Property: [Property Address]
Decision Date: [Decision Date]
Permission Valid Until: [Expiry Date — typically 5 years from decision]

Next Steps:

Your planning permission is now valid and construction can proceed once you comply with all conditions attached to the decision. I strongly recommend reviewing the conditions carefully before commencing work.

Key conditions to note:
[List any significant conditions]

The commencement notice must be submitted to [Council Name] at least 2 weeks before construction starts. I can assist with this if required.

This is fantastic news and I look forward to seeing your project take shape. Please do not hesitate to contact me if you have any questions about the conditions or next steps.

Kind regards,
[Your Name]
[Practice Name]
[Phone Number]`,
  },
  {
    id: "decision_refused",
    title: "Planning Permission Refused",
    situation: "Send to client when permission is refused",
    category: "decision",
    subject: "Planning Decision — [Reference Number]",
    body: `Dear [Client Name],

I am writing to inform you of the planning decision on your application.

Planning Reference: [Reference Number]
Property: [Property Address]
Decision Date: [Decision Date]
Decision: Refused

I have reviewed the reasons given by [Council Name] for the refusal. [Summary of main reasons in plain English].

Your Options:

1. Appeal to An Bord Pleanála: You have 4 weeks from the date of decision to lodge an appeal. An appeal costs €220 for individuals. I can advise on the merits of an appeal based on the reasons given.

2. Revise and Resubmit: In some cases, it may be possible to address the council's concerns through amendments and resubmit. This would require a new application fee.

3. Pre-planning Consultation: Before resubmitting, a pre-planning meeting with the council can help clarify what changes would make an application acceptable.

I would like to arrange a call to talk through your options. Please reply to this email or call me on [phone number] at your convenience.

Kind regards,
[Your Name]
[Practice Name]
[Phone Number]`,
  },
  {
    id: "appeal_lodged",
    title: "Appeal Lodged with An Bord Pleanála",
    situation: "Confirm to client when an appeal has been submitted to ABP",
    category: "appeal",
    subject: "Appeal Lodged — An Bord Pleanála — [Reference Number]",
    body: `Dear [Client Name],

I am writing to confirm that an appeal has been formally submitted to An Bord Pleanála (ABP) in respect of your planning application.

Original Reference: [Reference Number]
ABP Appeal Reference: [ABP Reference — if available]
Date of Appeal: [Appeal Date]

About the process:

An Bord Pleanála will notify all parties of the appeal and allow a period for submissions. The board will then carry out an independent assessment of the planning merits. They may request an oral hearing in complex cases, but most appeals are decided on written submissions.

ABP typically aims to decide appeals within 18 weeks, though this can vary.

I will submit a comprehensive appeal statement on your behalf and will keep you updated on any developments, including any requests for further submissions from the board.

In the meantime, please do not commence any development works on the site until the appeal has been decided.

Kind regards,
[Your Name]
[Practice Name]
[Phone Number]`,
  },
  {
    id: "application_validated",
    title: "Application Validated",
    situation: "Notify client when application has passed validation stage",
    category: "submission",
    subject: "Application Validated — Now on Public Display — [Reference Number]",
    body: `Dear [Client Name],

I am pleased to confirm that your planning application has been validated by [Council Name] and is now on public display.

Planning Reference: [Reference Number]
Validation Date: [Validation Date]
Public Display Period: [Start Date] to [End Date]

What this means:

The council has confirmed that your application is complete and meets the formal requirements for display. Members of the public and prescribed bodies can now view the application and submit observations during the display period.

Observations must be made in writing and accompanied by a fee of €20. The council must consider any observations received.

I will monitor the file for any observations submitted and advise you accordingly.

Kind regards,
[Your Name]
[Practice Name]
[Phone Number]`,
  },
  {
    id: "general_update",
    title: "General Progress Update",
    situation: "Send a general update to keep client informed of progress",
    category: "general",
    subject: "Planning Application Update — [Reference Number]",
    body: `Dear [Client Name],

I wanted to provide you with a brief update on the progress of your planning application.

Planning Reference: [Reference Number]
Current Status: [Current Stage]

[Write your update here — e.g. "Your application is currently under assessment by the planning authority. Everything is progressing as expected."]

Expected Timeline:

Based on the submission date, the statutory deadline for a decision is [Decision Deadline]. We are currently [on track / monitoring a potential delay / awaiting further information].

I will be in touch again as soon as there are any significant developments. As always, if you have any questions in the meantime please feel free to contact me.

Kind regards,
[Your Name]
[Practice Name]
[Phone Number]`,
  },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  submission: { label: "Submission",  color: "bg-blue-100 text-blue-700" },
  rfi:        { label: "FI Request",  color: "bg-red-100 text-red-700" },
  decision:   { label: "Decision",    color: "bg-green-100 text-green-700" },
  appeal:     { label: "Appeal",      color: "bg-orange-100 text-orange-700" },
  general:    { label: "General",     color: "bg-gray-100 text-gray-600" },
};

export default function EmailTemplatesPage() {
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  async function copyTemplate(t: EmailTemplate) {
    const text = `Subject: ${t.subject}\n\n${t.body}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openMailto(t: EmailTemplate) {
    const subject = encodeURIComponent(t.subject);
    const body = encodeURIComponent(t.body);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <DashboardShell breadcrumb={[{ label: "Client Email Templates" }]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Client Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pre-written plain-English email templates for common planning situations. Click to preview, copy, or open in your email client.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {["all", "submission", "rfi", "decision", "appeal", "general"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:border-blue-400"
              }`}
            >
              {cat === "all" ? "All templates" : CATEGORY_LABELS[cat]?.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Template list */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelected(t); setCopied(false); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === t.id
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
                    : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{t.title}</p>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_LABELS[t.category]?.color}`}>
                    {CATEGORY_LABELS[t.category]?.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-snug">{t.situation}</p>
              </button>
            ))}
          </div>

          {/* Preview panel */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{selected.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{selected.situation}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openMailto(selected)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      Open in email
                    </button>
                    <button
                      onClick={() => copyTemplate(selected)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        copied
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Subject line */}
                <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
                  <p className="text-xs font-semibold text-yellow-700 mb-0.5">Subject</p>
                  <p className="text-sm text-gray-900 font-mono">{selected.subject}</p>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {selected.body}
                  </pre>
                </div>

                {/* Usage note */}
                <div className="px-5 py-3 border-t border-gray-100 bg-blue-50">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">How to use:</span> Replace all items in [square brackets] with the actual details before sending.
                    Click &ldquo;Copy&rdquo; to copy the full email, or &ldquo;Open in email&rdquo; to launch directly in your email client.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                <div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Select a template to preview it</p>
                  <p className="text-xs text-gray-400 mt-1">{TEMPLATES.length} templates available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
