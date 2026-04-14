"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/AppShell";
import { LegalDisclaimer } from "@/app/components/LegalDisclaimer";
import { UpgradePrompt } from "@/app/components/UpgradePrompt";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import { SEAI_GRANTS, type SeaiGrant } from "@/lib/grants";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | "result";

type ProjectType =
  | "new-build"
  | "self-build"
  | "retrofit"
  | "extension"
  | "appearance"
  | "replacement";

type WorksCategory = "insulation" | "heating" | "solar" | "windows" | "ber";
type YearBuilt = "before-1978" | "1978-2006" | "2007-2011" | "after-2011" | "new-build";

interface Answers {
  projectType: ProjectType | null;
  worksCategories: WorksCategory[];
  yearBuilt: YearBuilt | null;
  socialWelfare: boolean | null;
  previousGrants: boolean | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROJECT_TYPE_TO_FLOW: Record<ProjectType, SeaiGrant["applicableTo"][number]> = {
  "new-build":   "new-build",
  "self-build":  "self-build",
  "retrofit":    "retrofit",
  "extension":   "extension",
  "appearance":  "appearance",
  "replacement": "replacement",
};

function computeResults(answers: Answers): { grants: SeaiGrant[]; warmerHomes: boolean } {
  const { projectType, worksCategories, yearBuilt, socialWelfare, previousGrants } = answers;
  if (!projectType) return { grants: [], warmerHomes: false };

  const flowType = PROJECT_TYPE_TO_FLOW[projectType];
  const isNewBuild = yearBuilt === "new-build" || projectType === "new-build" || projectType === "self-build";
  const isPost2011 = yearBuilt === "after-2011";

  const grants = SEAI_GRANTS.filter(g => {
    // Must be applicable to this flow type
    if (!g.applicableTo.includes(flowType)) return false;
    // Filter by selected works categories (if user selected any)
    if (worksCategories.length > 0 && !worksCategories.includes(g.worksCategory)) return false;
    // Pre-2011 requirement
    if (g.requiresPre2011 && (isPost2011 || isNewBuild)) return false;
    // Previous grants — disqualify same category
    if (previousGrants && g.id !== "ber") return false; // BER can always be reclaimed
    return true;
  });

  const warmerHomes = !!(socialWelfare && !isNewBuild);

  return { grants, warmerHomes };
}

// ─── Step components ──────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  const stepNum = step === "result" ? 5 : (step as number);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500">
          {step === "result" ? "Your personalised results" : `Question ${stepNum} of 5`}
        </p>
        <p className="text-xs text-gray-400">{stepNum * 20}%</p>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${stepNum * 20}%` }}
        />
      </div>
    </div>
  );
}

function OptionCard({
  label,
  sublabel,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
        selected
          ? "border-green-500 bg-green-50 ring-1 ring-green-500"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${selected ? "text-green-800" : "text-gray-900"}`}>{label}</p>
          {sublabel && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sublabel}</p>}
        </div>
        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
          selected ? "border-green-500 bg-green-500" : "border-gray-300"
        }`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

function MultiOptionCard({
  label,
  sublabel,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
        selected
          ? "border-green-500 bg-green-50 ring-1 ring-green-500"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${selected ? "text-green-800" : "text-gray-900"}`}>{label}</p>
          {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
        </div>
        <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
          selected ? "border-green-500 bg-green-500" : "border-gray-300"
        }`}>
          {selected && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GrantsPage() {
  const { isPaid, isArchitect } = useAuthStatus();
  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<Answers>({
    projectType: null,
    worksCategories: [],
    yearBuilt: null,
    socialWelfare: null,
    previousGrants: null,
  });

  function toggleWorks(cat: WorksCategory) {
    setAnswers(prev => ({
      ...prev,
      worksCategories: prev.worksCategories.includes(cat)
        ? prev.worksCategories.filter(c => c !== cat)
        : [...prev.worksCategories, cat],
    }));
  }

  function handleReset() {
    setStep(1);
    setAnswers({ projectType: null, worksCategories: [], yearBuilt: null, socialWelfare: null, previousGrants: null });
  }

  const { grants, warmerHomes } = computeResults(answers);

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-4 py-8 sm:px-6">

        {/* Page header */}
        <div className="mb-7 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 border border-green-100 mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">SEAI Grants Checker</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Find out which SEAI energy grants you may qualify for — takes about 60 seconds.
          </p>
        </div>

        {step !== 1 && (
          <ProgressBar step={step} />
        )}

        {/* ─── Step 1: Project type ─────────────────────────────── */}
        {step === 1 && (
          <div>
            <ProgressBar step={1} />
            <h2 className="text-base font-semibold text-gray-900 mb-4">What best describes your project?</h2>
            <div className="space-y-2.5">
              {[
                { value: "retrofit" as ProjectType, label: "Home energy upgrade / retrofit", sublabel: "Upgrading insulation, heating or windows in an existing home" },
                { value: "extension" as ProjectType, label: "Extension or conversion", sublabel: "Adding to or converting part of an existing home" },
                { value: "appearance" as ProjectType, label: "Change of appearance", sublabel: "Replacing windows, doors or external finishes" },
                { value: "new-build" as ProjectType, label: "New build (developer / standard build)", sublabel: "A new home you are purchasing or having built by a developer" },
                { value: "self-build" as ProjectType, label: "Self-build", sublabel: "A new home you are project managing or building yourself" },
                { value: "replacement" as ProjectType, label: "Replacement dwelling", sublabel: "Demolishing and rebuilding an existing home on the same site" },
              ].map(opt => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  sublabel={opt.sublabel}
                  selected={answers.projectType === opt.value}
                  onClick={() => setAnswers(prev => ({ ...prev, projectType: opt.value }))}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={!answers.projectType}
              onClick={() => setStep(2)}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* ─── Step 2: Works planned ────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1.5">What works are you planning?</h2>
            <p className="text-xs text-gray-500 mb-4">Select all that apply. Skip if unsure.</p>
            <div className="space-y-2.5">
              {[
                { value: "insulation" as WorksCategory, label: "Insulation", sublabel: "Attic, cavity wall, external wall or rafter insulation" },
                { value: "heating" as WorksCategory, label: "Heating system", sublabel: "Heat pump replacing oil, gas or electric heating" },
                { value: "solar" as WorksCategory, label: "Solar PV panels", sublabel: "Solar panels to generate electricity" },
                { value: "windows" as WorksCategory, label: "Windows and doors", sublabel: "Replacing windows or external doors" },
                { value: "ber" as WorksCategory, label: "BER assessment only", sublabel: "Building Energy Rating certificate required for grant applications" },
              ].map(opt => (
                <MultiOptionCard
                  key={opt.value}
                  label={opt.label}
                  sublabel={opt.sublabel}
                  selected={answers.worksCategories.includes(opt.value)}
                  onClick={() => toggleWorks(opt.value)}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                {answers.worksCategories.length === 0 ? "Skip — show all" : "Next"}
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Year built ───────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1.5">When was the home built?</h2>
            <p className="text-xs text-gray-500 mb-4">This affects eligibility for some grants — certain SEAI grants are only available for homes built before 2011.</p>
            <div className="space-y-2.5">
              {[
                { value: "before-1978" as YearBuilt, label: "Before 1978", sublabel: "Typically solid wall construction, no cavity" },
                { value: "1978-2006" as YearBuilt, label: "1978 – 2006", sublabel: "Common cavity wall construction" },
                { value: "2007-2011" as YearBuilt, label: "2007 – 2011", sublabel: "Post-Celtic Tiger, before Part L 2011 changes" },
                { value: "after-2011" as YearBuilt, label: "After 2011", sublabel: "Some insulation and heat pump grants may not apply" },
                { value: "new-build" as YearBuilt, label: "New build / not yet built", sublabel: "Solar PV and BER grants still available" },
              ].map(opt => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  sublabel={opt.sublabel}
                  selected={answers.yearBuilt === opt.value}
                  onClick={() => setAnswers(prev => ({ ...prev, yearBuilt: opt.value }))}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button
                type="button"
                disabled={!answers.yearBuilt}
                onClick={() => setStep(4)}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 4: Social welfare ───────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1.5">Are you or any household member receiving social welfare payments?</h2>
            <p className="text-xs text-gray-500 mb-4">
              Households on certain social welfare payments may qualify for the SEAI Warmer Homes Scheme — which provides free energy upgrades rather than grants you pay for upfront.
            </p>
            <div className="space-y-2.5">
              <OptionCard
                label="Yes"
                sublabel="Receiving Fuel Allowance, One-Parent Family Payment, Job Seekers Allowance (12+ months), or Disability Allowance"
                selected={answers.socialWelfare === true}
                onClick={() => setAnswers(prev => ({ ...prev, socialWelfare: true }))}
              />
              <OptionCard
                label="No"
                selected={answers.socialWelfare === false}
                onClick={() => setAnswers(prev => ({ ...prev, socialWelfare: false }))}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(3)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button
                type="button"
                disabled={answers.socialWelfare === null}
                onClick={() => setStep(5)}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 5: Previous grants ──────────────────────────── */}
        {step === 5 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1.5">Have you received SEAI grants in the last 7 years for the same type of works?</h2>
            <p className="text-xs text-gray-500 mb-4">
              SEAI does not allow you to claim the same grant twice for the same property within a 7-year period.
            </p>
            <div className="space-y-2.5">
              <OptionCard
                label="Yes — I have received SEAI grants before for these works"
                selected={answers.previousGrants === true}
                onClick={() => setAnswers(prev => ({ ...prev, previousGrants: true }))}
              />
              <OptionCard
                label="No — I have not received SEAI grants for these works"
                selected={answers.previousGrants === false}
                onClick={() => setAnswers(prev => ({ ...prev, previousGrants: false }))}
              />
              <OptionCard
                label="Not sure"
                selected={answers.previousGrants === null && step === 5}
                onClick={() => setAnswers(prev => ({ ...prev, previousGrants: false }))}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(4)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep("result")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                See my results
              </button>
            </div>
          </div>
        )}

        {/* ─── Results ──────────────────────────────────────────── */}
        {step === "result" && (
          <div>
            {/* Summary header */}
            <div className={`rounded-2xl p-5 mb-5 ${
              grants.length > 0
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}>
              {grants.length > 0 ? (
                <>
                  <p className="text-3xl font-bold mb-1">
                    {grants.length} grant{grants.length !== 1 ? "s" : ""} found
                  </p>
                  <p className="text-green-100 text-sm">
                    Based on your answers, you may qualify for the following SEAI grants.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold mb-1">No matching grants found</p>
                  <p className="text-sm text-gray-600">
                    Based on your answers, the standard SEAI Better Energy Homes grants may not apply to your situation. You may still qualify for other schemes — see below.
                  </p>
                </>
              )}
            </div>

            {/* Warmer Homes Scheme notice — paid only */}
            {warmerHomes && (isPaid || isArchitect) && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">Warmer Homes Scheme — free upgrades</h3>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      Because you may be receiving qualifying social welfare payments, you could be eligible for the SEAI Warmer Homes Scheme. This provides free energy upgrades — including insulation, heating and draught-proofing — at no cost to you. This is separate from the Better Energy Homes grant scheme.
                    </p>
                    <a
                      href="https://www.seai.ie/grants/home-energy-grants/better-energy-warmer-homes/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 mt-2 underline underline-offset-2"
                    >
                      Apply for Warmer Homes Scheme at seai.ie
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Warmer Homes teaser — free users */}
            {warmerHomes && !isPaid && !isArchitect && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 mb-5">
                <p className="text-xs font-semibold text-blue-800">
                  You may also qualify for the Warmer Homes Scheme (free upgrades).
                </p>
                <p className="text-xs text-blue-600 mt-1">Upgrade to see full details and eligibility criteria.</p>
              </div>
            )}

            {/* Grant cards */}
            {grants.length > 0 && (
              <div className="space-y-4 mb-5">
                {grants.map(grant => (
                  <div key={grant.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Card header — always shown */}
                    <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-gray-100">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{grant.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{grant.works}</p>
                      </div>
                      <span className="text-lg font-bold text-green-700 shrink-0 whitespace-nowrap">{grant.amount}</span>
                    </div>
                    {/* Conditions + apply link — paid and architect access */}
                    {(isPaid || isArchitect) ? (
                      <>
                        <div className="p-4 sm:p-5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Key conditions</p>
                          <ul className="space-y-1.5">
                            {grant.conditions.map((cond, i) => (
                              <li key={i} className={`flex items-start gap-2.5 text-xs leading-relaxed ${
                                cond.includes("NOT start") || cond.includes("forfeits")
                                  ? "font-semibold text-red-700"
                                  : "text-gray-600"
                              }`}>
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                                  cond.includes("NOT start") || cond.includes("forfeits")
                                    ? "bg-red-500"
                                    : "bg-gray-400"
                                }`} />
                                {cond}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                          <a
                            href={grant.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50"
                          >
                            Apply at seai.ie
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="px-4 sm:px-5 py-3 text-xs text-gray-400">
                        Conditions and application link available with full access.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upgrade prompt for free users after results — architects always have access */}
            {!isPaid && !isArchitect && grants.length > 0 && (
              <UpgradePrompt
                feature="Full SEAI Grants Checker"
                description="See key conditions for each grant, Warmer Homes eligibility details, and direct application links at seai.ie."
                redirectTo="/grants"
              />
            )}

            {/* Critical warning */}
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-red-800">Do not start work before receiving your grant approval</p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    Starting any works before receiving a written grant approval letter from SEAI will disqualify your application and you will not receive any grant payment. Always apply first, wait for approval, then commission your contractor.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 mb-5">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-semibold">Grant amounts are subject to change.</span> The amounts shown reflect SEAI 2026 rates. Always verify current grant amounts at{" "}
                <a href="https://www.seai.ie" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-700 font-medium">seai.ie</a>
                {" "}before applying. This tool provides general guidance only and does not constitute financial or energy advice.
              </p>
            </div>

            <LegalDisclaimer className="mb-6" />

            <button
              type="button"
              onClick={handleReset}
              className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Start over
            </button>
          </div>
        )}

      </div>
    </AppShell>
  );
}
