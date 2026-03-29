"use client";

import { useState, useRef, useCallback } from "react";
import { AppShell } from "@/app/components/AppShell";
import { UpgradePrompt } from "@/app/components/UpgradePrompt";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectType =
  | "new-build-rural"
  | "new-build-urban"
  | "extension"
  | "replacement"
  | "change-of-use"
  | "retention"
  | "other";

interface FormState {
  county: string;
  projectType: ProjectType | "";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTIES = [
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry",
  "Kildare","Kilkenny","Laois","Leitrim","Limerick","Longford","Louth",
  "Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary",
  "Waterford","Westmeath","Wexford","Wicklow",
];

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "new-build-rural",  label: "New One-Off Rural Dwelling" },
  { value: "new-build-urban",  label: "New Dwelling (Urban / Suburban)" },
  { value: "extension",        label: "Extension or Alteration to Existing Dwelling" },
  { value: "replacement",      label: "Replacement Dwelling" },
  { value: "change-of-use",    label: "Change of Use" },
  { value: "retention",        label: "Retention of Unauthorised Development" },
  { value: "other",            label: "Other Development" },
];

const EMPTY_FORM: FormState = {
  county: "",
  projectType: "",
  siteAddress: "",
  projectDescription: "",
  siteArea: "",
  proposedFloorArea: "",
  siteDescription: "",
  cdpCompliance: "",
  localNeeds: "",
  locationJustification: "",
  applicantName: "",
  agentName: "",
};

// ─── Helper components ────────────────────────────────────────────────────────

function FieldLabel({
  label,
  required,
  hint,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div className="mb-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-800"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white";

const textareaCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white resize-y leading-relaxed";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-2 flex items-center gap-2">
      <span className="flex-1 h-px bg-gray-100" />
      <span className="shrink-0">{children}</span>
      <span className="flex-1 h-px bg-gray-100" />
    </h2>
  );
}

// ─── Statement renderer ───────────────────────────────────────────────────────
// Renders the raw text statement with proper formatting for display and print.

function StatementRenderer({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed space-y-3 print:space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Section heading: "1. UPPERCASE TITLE" or "1. Title"
        if (/^\d+\.\s+[A-Z]/.test(trimmed) && !trimmed.includes(".1") && !trimmed.includes(".2")) {
          return (
            <h2
              key={i}
              className="text-base font-bold text-gray-900 uppercase tracking-wide mt-6 mb-2 print:mt-4"
            >
              {trimmed}
            </h2>
          );
        }

        // Subsection heading: "1.1 Title" or "1.2 Title"
        if (/^\d+\.\d+\s+/.test(trimmed)) {
          return (
            <h3 key={i} className="text-sm font-semibold text-gray-900 mt-4 mb-1 print:mt-3">
              {trimmed}
            </h3>
          );
        }

        return <p key={i} className="text-sm leading-7 text-gray-800">{trimmed}</p>;
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlanningStatementPage() {
  const { isLoggedIn, loading: authLoading } = useAuthStatus();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [statement, setStatement] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const statementRef = useRef<HTMLDivElement>(null);

  const isRuralNewBuild = form.projectType === "new-build-rural";

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setApiError(null);
    setStatement(null);

    try {
      const res = await fetch("/api/planning-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { statement?: string; error?: string };
      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatement(data.statement ?? "");
      setTimeout(() => {
        document.getElementById("statement-output")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  async function handleCopy() {
    if (!statement) return;
    await navigator.clipboard.writeText(statement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handlePrint() {
    window.print();
  }

  function handleReset() {
    setStatement(null);
    setApiError(null);
    setForm(EMPTY_FORM);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Auth states ──

  if (authLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppShell>
        <UpgradePrompt
          feature="Planning Statement Generator"
          description="Generate a professionally worded planning statement draft in minutes — then refine with your planning consultant before submission."
        />
      </AppShell>
    );
  }

  // ── Render ──

  return (
    <AppShell>
      {/* ── Print styles injected via a style tag ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 2.5cm 2.5cm 2.5cm 3cm !important;
            font-size: 11pt !important;
            line-height: 1.7 !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">

        {/* Page header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-4">
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-semibold text-green-700">Premium Tool</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Planning Statement Generator
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
            Fill in the form below and Planr will generate a professionally worded planning statement draft — ready to refine with your planning consultant before submission.
          </p>
        </div>

        {/* Draft warning */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-8 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-900">This generates a first draft for professional review</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              The output is a starting-point draft only — not a finished legal document. It must be reviewed and verified by a qualified planning professional (MIPAV or MRTPI) before submission to any planning authority. Policy references should be confirmed against the current county development plan.
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        {!statement && (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section: Project Overview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
              <SectionHeading>Project Overview</SectionHeading>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel label="County" required htmlFor="county" />
                  <select
                    id="county"
                    value={form.county}
                    onChange={e => setField("county", e.target.value)}
                    required
                    className={inputCls}
                  >
                    <option value="">Select county…</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel label="Project Type" required htmlFor="projectType" />
                  <select
                    id="projectType"
                    value={form.projectType}
                    onChange={e => setField("projectType", e.target.value as ProjectType)}
                    required
                    className={inputCls}
                  >
                    <option value="">Select type…</option>
                    {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel
                  label="Site Address"
                  required
                  htmlFor="siteAddress"
                  hint="Full postal address of the site, including townland if rural"
                />
                <input
                  id="siteAddress"
                  type="text"
                  value={form.siteAddress}
                  onChange={e => setField("siteAddress", e.target.value)}
                  required
                  placeholder="e.g. Ballycumber Lower, Tullamore, Co. Offaly"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel
                    label="Applicant Name"
                    htmlFor="applicantName"
                    hint="Optional — used in the statement header"
                  />
                  <input
                    id="applicantName"
                    type="text"
                    value={form.applicantName}
                    onChange={e => setField("applicantName", e.target.value)}
                    placeholder="e.g. John and Mary Murphy"
                    className={inputCls}
                  />
                </div>
                <div>
                  <FieldLabel
                    label="Agent / Architect Name"
                    htmlFor="agentName"
                    hint="Optional — planning consultant or architect preparing the application"
                  />
                  <input
                    id="agentName"
                    type="text"
                    value={form.agentName}
                    onChange={e => setField("agentName", e.target.value)}
                    placeholder="e.g. Murphy Architects Ltd"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Section: Site Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
              <SectionHeading>Site Information</SectionHeading>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel
                    label="Site Area"
                    htmlFor="siteArea"
                    hint="Total area of the site or landholding"
                  />
                  <input
                    id="siteArea"
                    type="text"
                    value={form.siteArea}
                    onChange={e => setField("siteArea", e.target.value)}
                    placeholder="e.g. 0.4 hectares / 4,000 sq m"
                    className={inputCls}
                  />
                </div>
                <div>
                  <FieldLabel
                    label="Proposed Floor Area"
                    htmlFor="proposedFloorArea"
                    hint="Gross floor area of the proposed works"
                  />
                  <input
                    id="proposedFloorArea"
                    type="text"
                    value={form.proposedFloorArea}
                    onChange={e => setField("proposedFloorArea", e.target.value)}
                    placeholder="e.g. 180 sq m / 40 sq m extension"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <FieldLabel
                  label="Site Description"
                  required
                  htmlFor="siteDescription"
                  hint="Describe the existing site — its character, surroundings, road frontage, existing buildings, landscape context, and any notable features"
                />
                <textarea
                  id="siteDescription"
                  value={form.siteDescription}
                  onChange={e => setField("siteDescription", e.target.value)}
                  required
                  rows={5}
                  placeholder="e.g. The site is located in open countryside approximately 3 km south-west of the village of Ballycumber. It forms part of a family landholding of approximately 12 hectares in agricultural use. The site is bounded to the north by a county road, to the east by a mature hedgerow..."
                  className={textareaCls}
                />
              </div>
            </div>

            {/* Section: Proposed Development */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
              <SectionHeading>Proposed Development</SectionHeading>

              <div>
                <FieldLabel
                  label="Description of Proposed Development"
                  required
                  htmlFor="projectDescription"
                  hint="Full description of what is being proposed — type, scale, design, materials, access, and services"
                />
                <textarea
                  id="projectDescription"
                  value={form.projectDescription}
                  onChange={e => setField("projectDescription", e.target.value)}
                  required
                  rows={5}
                  placeholder="e.g. The proposed development consists of the construction of a two-storey detached dwelling house of approximately 180 sq m gross floor area. The dwelling will be of traditional proportions with a pitched roof finished in natural slate. External walls will be rendered in a smooth off-white finish. A new vehicular entrance is proposed off the county road to the north..."
                  className={textareaCls}
                />
              </div>
            </div>

            {/* Section: Planning Policy Compliance */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
              <SectionHeading>Planning Policy Compliance</SectionHeading>

              <div>
                <FieldLabel
                  label="Compliance with County Development Plan"
                  required
                  htmlFor="cdpCompliance"
                  hint="Explain how the proposed development complies with the objectives and policies of the county development plan. Reference specific policy numbers if known."
                />
                <textarea
                  id="cdpCompliance"
                  value={form.cdpCompliance}
                  onChange={e => setField("cdpCompliance", e.target.value)}
                  required
                  rows={5}
                  placeholder="e.g. The proposed development is consistent with the objectives of the Offaly County Development Plan 2021–2027. The site is located in an area designated as Open Countryside in the CDP, where rural housing is considered appropriate for applicants with a genuine local connection. The proposal complies with Policy RH-1 which supports rural housing for persons with an established local needs connection..."
                  className={textareaCls}
                />
              </div>

              {/* Local needs — only for rural new build */}
              {isRuralNewBuild && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-4">
                  <p className="text-xs font-semibold text-blue-800">
                    Rural New Build — Local Needs Justification required
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Under the Sustainable Rural Housing Guidelines 2005 and county development plan rural housing policies, applicants must demonstrate an intrinsic or functional need to live in the rural area. Set out the applicant&apos;s local connection in detail.
                  </p>
                  <div>
                    <FieldLabel
                      label="Local Needs Justification"
                      required={isRuralNewBuild}
                      htmlFor="localNeeds"
                      hint="Include: family connection to the landholding, years lived/worked in the area, distance from home place, nature of employment if rural, any previous unsuccessful search for housing"
                    />
                    <textarea
                      id="localNeeds"
                      value={form.localNeeds}
                      onChange={e => setField("localNeeds", e.target.value)}
                      required={isRuralNewBuild}
                      rows={6}
                      placeholder="e.g. The applicant, John Murphy, was born and raised on the family farm at this location. He has lived in the Ballycumber area his entire life, attending the local national school and working on the farm since leaving secondary school. The site forms part of the family landholding which has been in the Murphy family for in excess of 50 years. The applicant's parents continue to reside in the original family farmhouse approximately 300 metres from the proposed site..."
                      className={textareaCls}
                    />
                  </div>
                </div>
              )}

              <div>
                <FieldLabel
                  label="Why is this location appropriate for this development?"
                  required
                  htmlFor="locationJustification"
                  hint="Explain why the site is suitable — access, services, landscape impact, relationship to existing development, sustainability"
                />
                <textarea
                  id="locationJustification"
                  value={form.locationJustification}
                  onChange={e => setField("locationJustification", e.target.value)}
                  required
                  rows={4}
                  placeholder="e.g. The proposed site is positioned to minimise visual impact on the surrounding landscape, sited against an existing field boundary with a mature hedgerow backdrop. It is located 3 km from Ballycumber village with its range of community services. A percolation test has confirmed the site is suitable for a domestic wastewater treatment system. Road access is safe and adequate with good sight lines in both directions..."
                  className={textareaCls}
                />
              </div>
            </div>

            {/* Error */}
            {apiError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2.5"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating planning statement…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Generate Planning Statement
                </>
              )}
            </button>

          </form>
        )}

        {/* ── Statement output ── */}
        {statement && (
          <div id="statement-output">

            {/* Action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Planning Statement — Draft</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {form.siteAddress}{form.county ? ` · ${form.county}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${
                    copied
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy text
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  Print / Save as PDF
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                >
                  New statement
                </button>
              </div>
            </div>

            {/* Draft warning — shown in output too */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6 print:hidden">
              <p className="text-xs font-semibold text-amber-900 mb-0.5">Draft document — not for direct submission</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                This AI-generated planning statement is a first draft only. Before submission, it must be reviewed by a qualified planning consultant (MIPAV) or architect to verify policy references, confirm compliance with the current county development plan, and expand on site-specific detail. Planning policy changes frequently — verify all references at your planning authority&apos;s website.
              </p>
            </div>

            {/* Statement document */}
            <div
              id="print-area"
              ref={statementRef}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Document header — for print */}
              <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-gray-100">
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Planning Statement</p>
                  <h1 className="text-lg font-bold text-gray-900">
                    {form.siteAddress || "Site Address"}
                  </h1>
                  {form.county && (
                    <p className="text-sm text-gray-500">Co. {form.county}</p>
                  )}
                  {(form.applicantName || form.agentName) && (
                    <div className="pt-2 text-xs text-gray-500 space-y-0.5">
                      {form.applicantName && <p>Applicant: {form.applicantName}</p>}
                      {form.agentName && <p>Prepared by: {form.agentName}</p>}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 pt-1">
                    {new Date().toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Draft watermark label — visible in print */}
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 print:block">
                <p className="text-xs text-amber-700 text-center font-medium">
                  DRAFT — For review by a qualified planning professional before submission. Not a finished legal document.
                </p>
              </div>

              {/* Statement body */}
              <div className="px-6 sm:px-10 py-8">
                <StatementRenderer text={statement} />
              </div>

              {/* Footer */}
              <div className="px-6 sm:px-10 py-5 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 leading-relaxed">
                  This planning statement was generated as a first draft using Planr (planr.ie) and must be reviewed by a qualified planning professional before submission. Policy references should be verified against the current county development plan. Planr accepts no liability for decisions made based on this draft document.
                </p>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-wrap gap-3 mt-6 print:hidden">
              <button
                type="button"
                onClick={handleCopy}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl border transition-colors ${
                  copied
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {copied ? "Copied!" : "Copy as text"}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
                Print / Save as PDF
              </button>
            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}
