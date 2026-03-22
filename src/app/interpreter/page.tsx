"use client";

import { useState, useRef, useCallback } from "react";
import type { InterpretDocumentResult } from "@/app/api/interpret-document/route";
import { AppShell } from "@/app/components/AppShell";

const DOCUMENT_TYPES = [
  "RFI (Request for Further Information)",
  "Planning Conditions",
  "Third Party Observation",
  "Appeal Decision",
];

const PRIORITY_CONFIG = {
  urgent: {
    label: "Urgent",
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-600",
  },
  normal: {
    label: "Normal",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-600",
  },
  fyi: {
    label: "FYI",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    dot: "bg-blue-600",
  },
} as const;

const VERDICT_CONFIG = {
  good: {
    card: "border-green-200 bg-green-50",
    heading: "text-green-700",
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-600",
    label: "Good news",
  },
  bad: {
    card: "border-red-200 bg-red-50",
    heading: "text-red-700",
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-600",
    label: "Bad news",
  },
  neutral: {
    card: "border-gray-200 bg-gray-50",
    heading: "text-gray-700",
    badge: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-500",
    label: "Neutral",
  },
} as const;

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function IconFile({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const inputClass =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";

export default function InterpreterPage() {
  const [documentType, setDocumentType] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterpretDocumentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractFile = useCallback(async (file: File) => {
    setExtracting(true);
    setExtractError(null);
    setDocumentText("");
    setUploadedFileName(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setExtractError(data.error ?? "Failed to read the file.");
        return;
      }
      setDocumentText(data.text);
      setUploadedFileName(file.name);
    } catch {
      setExtractError("Network error. Please try again or paste the text manually.");
    } finally {
      setExtracting(false);
    }
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) extractFile(file);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) extractFile(file);
  }

  function clearUpload() {
    setUploadedFileName(null);
    setDocumentText("");
    setExtractError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function switchMode(mode: "upload" | "paste") {
    setInputMode(mode);
    setExtractError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/interpret-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType, documentText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data as InterpretDocumentResult);
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const verdictConfig = result ? VERDICT_CONFIG[result.verdictType] : null;
  const hasText = documentText.trim().length >= 50;

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-7 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Document Interpreter
          </h1>
          <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
            Upload or paste any Irish planning document — an RFI, planning conditions, third party
            observation, or appeal decision — and get a plain English breakdown with prioritised
            actions and deadlines.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 shadow-sm"
        >
          {/* Document type */}
          <div>
            <label className={labelClass} htmlFor="documentType">
              Document type <span className="text-red-500">*</span>
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              className={inputClass + " appearance-none cursor-pointer"}
            >
              <option value="" disabled>Select document type…</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Document input */}
          <div>
            {/* Label + mode toggle */}
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <label className="block text-sm font-medium text-gray-700">
                Document <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => switchMode("upload")}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    inputMode === "upload"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Upload file
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("paste")}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    inputMode === "paste"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Paste text
                </button>
              </div>
            </div>

            {/* Upload mode */}
            {inputMode === "upload" && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload document"
                />

                {!uploadedFileName && !extracting && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 sm:py-12 cursor-pointer transition-colors select-none ${
                      isDragOver
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDragOver ? "bg-green-100" : "bg-gray-100"}`}>
                      <IconUpload className={`w-5 h-5 transition-colors ${isDragOver ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium transition-colors ${isDragOver ? "text-green-700" : "text-gray-600"}`}>
                        {isDragOver ? "Drop to upload" : "Drag & drop your document here"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF or Word (.docx) · or{" "}
                        <span className="text-green-600 underline underline-offset-2">browse files</span>
                      </p>
                    </div>
                  </div>
                )}

                {extracting && (
                  <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-6 py-10">
                    <Spinner className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Extracting text from document…</span>
                  </div>
                )}

                {uploadedFileName && !extracting && (
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <IconFile className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 truncate">{uploadedFileName}</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {documentText.length.toLocaleString()} characters extracted
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-green-700">
                        <IconCheck className="w-3.5 h-3.5" />
                        Ready
                      </div>
                      <button
                        type="button"
                        onClick={clearUpload}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                        aria-label="Remove file"
                      >
                        <IconX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {extractError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5">
                    <span className="flex-1">{extractError}</span>
                    <button
                      type="button"
                      onClick={() => setExtractError(null)}
                      className="flex-shrink-0 hover:text-red-900 transition-colors"
                    >
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  Supports PDF and Word (.docx) documents. Scanned PDFs (image-only) cannot be extracted — paste the text manually instead.
                </p>
              </div>
            )}

            {/* Paste mode */}
            {inputMode === "paste" && (
              <div>
                <textarea
                  id="documentText"
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  rows={12}
                  placeholder="Paste the full text of the planning document here…"
                  className={inputClass + " resize-y leading-relaxed"}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Paste the complete document for the most accurate analysis.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !hasText}
            className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm"
          >
            {loading ? (
              <>
                <Spinner className="h-5 w-5 text-white" />
                Interpreting document…
              </>
            ) : (
              "Interpret document"
            )}
          </button>
        </form>

        {/* Submission error */}
        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && verdictConfig && (
          <div id="result" className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">

            {/* Verdict */}
            <div className={`rounded-2xl border ${verdictConfig.card} p-5 sm:p-6`}>
              <div className="mb-3">
                <span className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${verdictConfig.badge}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${verdictConfig.dot}`} />
                  {verdictConfig.label}
                </span>
              </div>
              <p className={`text-base font-semibold leading-snug ${verdictConfig.heading}`}>
                {result.verdict}
              </p>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Summary
              </h2>
              <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                {result.summary.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Actions */}
            {result.actions?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Actions required
                </h2>
                <ul className="space-y-3">
                  {result.actions.map((item, i) => {
                    const pc = PRIORITY_CONFIG[item.priority];
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-0.5 flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${pc.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pc.dot}`} />
                          {pc.label}
                        </span>
                        <span className="text-sm text-gray-700 leading-relaxed pt-0.5">{item.action}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Deadlines */}
            {result.deadlines?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-4">
                  Deadlines
                </h2>
                <ul className="space-y-2.5">
                  {result.deadlines.map((deadline, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-amber-800 leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-amber-500" />
                      {deadline}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={() => {
                setResult(null);
                setError(null);
                setDocumentText("");
                clearUpload();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              Interpret another document
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 sm:mt-8 flex gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
            />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Guidance only — not legal advice.</span>{" "}
            This tool provides a general interpretation of planning documents. It is not a substitute
            for advice from a qualified planning consultant, architect, or solicitor. Always verify
            deadlines and requirements directly with the issuing authority before taking action.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
