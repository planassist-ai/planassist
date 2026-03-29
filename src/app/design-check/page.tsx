"use client";

import { useState, useRef } from "react";
import { AppShell } from "@/app/components/AppShell";
import { UpgradePrompt } from "@/app/components/UpgradePrompt";
import { LegalDisclaimer } from "@/app/components/LegalDisclaimer";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import type { DesignCheckResult } from "@/app/api/design-check/route";

// ─── Constants ─────────────────────────────────────────────────────────────────

const COUNTIES = [
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin",
  "Galway","Kerry","Kildare","Kilkenny","Laois","Leitrim",
  "Limerick","Longford","Louth","Mayo","Meath","Monaghan",
  "Offaly","Roscommon","Sligo","Tipperary","Waterford",
  "Westmeath","Wexford","Wicklow",
];

const PROJECT_TYPES = [
  { value: "new-build-rural",       label: "New Build — Rural Dwelling" },
  { value: "new-build-urban",       label: "New Build — Urban / Suburban Dwelling" },
  { value: "extension",             label: "Extension or Alteration" },
  { value: "change-of-appearance",  label: "Change of Appearance" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 4;

const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Spinner({ light = false }: { light?: boolean }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${light ? "text-white" : "text-green-600"}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function AlignmentBadge({ level }: { level: DesignCheckResult["alignmentLevel"] }) {
  const configs = {
    STRONG:   { text: "Strong Alignment",    classes: "bg-green-100 text-green-700 border border-green-200",  dot: "bg-green-600" },
    MODERATE: { text: "Moderate Alignment",  classes: "bg-amber-100 text-amber-700 border border-amber-200",  dot: "bg-amber-500" },
    CONCERNS: { text: "Design Concerns",     classes: "bg-red-100 text-red-700 border border-red-200",        dot: "bg-red-500" },
  };
  const c = configs[level];
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${c.classes}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.text}
    </span>
  );
}

function ResultSection({
  title,
  icon,
  children,
  accent = "gray",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: "green" | "amber" | "blue" | "purple" | "gray";
}) {
  const accentMap = {
    green:  { header: "bg-green-50 border-green-200",  icon: "text-green-600", title: "text-green-800" },
    amber:  { header: "bg-amber-50 border-amber-200",  icon: "text-amber-600", title: "text-amber-800" },
    blue:   { header: "bg-blue-50 border-blue-200",    icon: "text-blue-600",  title: "text-blue-800" },
    purple: { header: "bg-purple-50 border-purple-200",icon: "text-purple-600",title: "text-purple-800" },
    gray:   { header: "bg-gray-50 border-gray-200",    icon: "text-gray-500",  title: "text-gray-700" },
  };
  const a = accentMap[accent];
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${a.header}`}>
        <span className={`flex-shrink-0 ${a.icon}`}>{icon}</span>
        <h3 className={`text-sm font-bold uppercase tracking-wide ${a.title}`}>{title}</h3>
      </div>
      <div className="px-5 py-4 bg-white">{children}</div>
    </div>
  );
}

function BulletList({ items, dotColor }: { items: string[]; dotColor: string }) {
  if (!items.length) return <p className="text-sm text-gray-400 italic">None identified.</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
          <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function DesignCheckPage() {
  const { isLoggedIn, loading: authLoading } = useAuthStatus();

  const [county, setCounty]               = useState("");
  const [projectType, setProjectType]     = useState("");
  const [inputMode, setInputMode]         = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imageUrl, setImageUrl]           = useState("");
  const [dragging, setDragging]           = useState(false);
  const [fileError, setFileError]         = useState<string | null>(null);
  const [submitting, setSubmitting]       = useState(false);
  const [result, setResult]               = useState<DesignCheckResult | null>(null);
  const [apiError, setApiError]           = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auth gate ───────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      </AppShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppShell>
        <UpgradePrompt
          feature="Design Guide Checker"
          description="Upload a photo, sketch, or elevation and get instant AI analysis of your design against your county's published planning design guidelines — before you submit."
        />
      </AppShell>
    );
  }

  // ── File handling ───────────────────────────────────────────────────────────

  function handleFile(file: File) {
    setFileError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }
    setImageFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ── Submission ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!county || !projectType) return;

    setSubmitting(true);
    setResult(null);
    setApiError(null);

    try {
      let res: Response;

      if (inputMode === "upload") {
        if (!imageFile) { setApiError("Please select an image to upload."); setSubmitting(false); return; }
        const fd = new FormData();
        fd.append("county", county);
        fd.append("projectType", projectType);
        fd.append("image", imageFile);
        res = await fetch("/api/design-check", { method: "POST", body: fd });
      } else {
        if (!imageUrl.trim()) { setApiError("Please enter an image URL."); setSubmitting(false); return; }
        res = await fetch("/api/design-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ county, projectType, imageUrl: imageUrl.trim() }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setApiError((data as { error?: string }).error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data as DesignCheckResult);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setResult(null);
    setApiError(null);
    setImageFile(null);
    setImageUrl("");
    setCounty("");
    setProjectType("");
    setFileError(null);
  }

  // ── Render result ───────────────────────────────────────────────────────────

  if (result) {
    const overallBg = {
      STRONG:   "border-green-200 bg-green-50",
      MODERATE: "border-amber-200 bg-amber-50",
      CONCERNS: "border-red-200 bg-red-50",
    }[result.alignmentLevel];

    const overallText = {
      STRONG:   "text-green-900",
      MODERATE: "text-amber-900",
      CONCERNS: "text-red-900",
    }[result.alignmentLevel];

    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-3xl mx-auto">

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Check another design
          </button>

          {/* Header result card */}
          <div className={`rounded-2xl border p-5 sm:p-6 mb-5 ${overallBg}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="mb-3">
                  <AlignmentBadge level={result.alignmentLevel} />
                </div>
                <h2 className={`text-lg sm:text-xl font-bold mb-3 ${overallText}`}>Overall Assessment</h2>
                <p className={`text-sm leading-relaxed ${overallText}`}>{result.overallAssessment}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Positive elements */}
            <ResultSection
              title="Positive Elements"
              accent="green"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <BulletList items={result.positiveElements} dotColor="bg-green-500" />
            </ResultSection>

            {/* Potential concerns */}
            <ResultSection
              title="Potential Concerns"
              accent="amber"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              }
            >
              <BulletList items={result.potentialConcerns} dotColor="bg-amber-500" />
            </ResultSection>

            {/* Recommendations */}
            <ResultSection
              title="Recommendations"
              accent="blue"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            >
              <BulletList items={result.recommendations} dotColor="bg-blue-500" />
            </ResultSection>

            {/* County-specific notes */}
            <ResultSection
              title="County-Specific Notes"
              accent="purple"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              }
            >
              <p className="text-sm text-gray-700 leading-relaxed">{result.countyNotes}</p>
            </ResultSection>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            Check another design
          </button>

          <LegalDisclaimer className="mt-8 sm:mt-10" />
        </div>
      </AppShell>
    );
  }

  // ── Render form ─────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">Design Guide Checker</h1>
              <span className="inline-block mt-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Premium</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Upload a photograph, sketch, or rendered elevation and get instant AI analysis of your design against your county&apos;s published planning design guidelines. Identify issues before they become objections.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* County + Project Type */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass} htmlFor="dc-county">County <span className="text-red-500">*</span></label>
                <select
                  id="dc-county"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  required
                  className={inputClass + " appearance-none cursor-pointer"}
                >
                  <option value="" disabled>Select a county…</option>
                  {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="dc-type">Project type <span className="text-red-500">*</span></label>
                <select
                  id="dc-type"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  required
                  className={inputClass + " appearance-none cursor-pointer"}
                >
                  <option value="" disabled>Select…</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Image input */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className={labelClass}>Image <span className="text-red-500">*</span></p>
            <p className="text-xs text-gray-400 mb-4 -mt-1">Upload a photo of your existing property, a sketch, a rendered elevation, or a site photo. Supports JPEG, PNG, WebP, GIF — max {MAX_MB} MB.</p>

            {/* Mode tabs */}
            <div className="flex gap-2 mb-5">
              {(["upload", "url"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setInputMode(mode); setImageFile(null); setImageUrl(""); setFileError(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    inputMode === mode
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"
                  }`}
                >
                  {mode === "upload" ? "Upload image" : "Enter URL"}
                </button>
              ))}
            </div>

            {inputMode === "upload" ? (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none ${
                    dragging
                      ? "border-green-400 bg-green-50"
                      : imageFile
                      ? "border-green-300 bg-green-50/40"
                      : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                  {imageFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-green-700">{imageFile.name}</p>
                      <p className="text-xs text-gray-400">{formatBytes(imageFile.size)} — click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-700">Drop your image here</p>
                      <p className="text-xs text-gray-400">or click to browse</p>
                    </div>
                  )}
                </div>
                {fileError && (
                  <p className="mt-2 text-xs text-red-600">{fileError}</p>
                )}
              </>
            ) : (
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Paste a direct link to a publicly accessible image file (JPEG, PNG, or WebP).
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {apiError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              submitting ||
              !county ||
              !projectType ||
              (inputMode === "upload" && !imageFile) ||
              (inputMode === "url" && !imageUrl.trim())
            }
            className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors text-sm"
          >
            {submitting ? (
              <>
                <Spinner light />
                Analysing design against {county || "county"} guidelines…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Analyse design
              </>
            )}
          </button>

        </form>

        <LegalDisclaimer className="mt-8 sm:mt-10" />
      </div>
    </AppShell>
  );
}
