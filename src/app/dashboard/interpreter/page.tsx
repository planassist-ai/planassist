"use client";

import { useState } from "react";

const DOC_TYPES = [
  "Request for Further Information (RFI)",
  "Planning Conditions",
  "Third Party Observation",
  "Appeal Decision",
  "Pre-Application Consultation Response",
  "Agent Letter",
  "Other Planning Document",
];

interface DocumentAction {
  action: string;
  priority: "urgent" | "normal" | "fyi";
}

interface Result {
  summary: string;
  actions: DocumentAction[];
  deadlines: string[];
  verdict: string;
  verdictType: "good" | "bad" | "neutral";
}

const PRIORITY_STYLE: Record<string, string> = {
  urgent: "bg-red-50 border-red-200 text-red-800",
  normal: "bg-amber-50 border-amber-200 text-amber-800",
  fyi:    "bg-slate-50 border-slate-200 text-slate-700",
};
const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-red-500",
  normal: "bg-amber-500",
  fyi:    "bg-slate-400",
};

const VERDICT_STYLE: Record<string, string> = {
  good:    "bg-emerald-50 border-emerald-200 text-emerald-800",
  bad:     "bg-red-50 border-red-200 text-red-800",
  neutral: "bg-blue-50 border-blue-200 text-blue-800",
};
const VERDICT_LABEL: Record<string, string> = {
  good: "Good News", bad: "Attention Required", neutral: "For Your Information",
};

export default function InterpreterPage() {
  const [docType, setDocType] = useState("");
  const [docText, setDocText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!docType || !docText.trim()) {
      setError("Please select a document type and paste the document text.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/interpret-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: docType, documentText: docText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Failed to interpret document.");
        return;
      }
      setResult(data as Result);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copySummary() {
    if (!result) return;
    const text = [
      `VERDICT: ${result.verdict}`,
      "",
      "SUMMARY:",
      result.summary,
      "",
      result.actions.length > 0 ? "ACTIONS:" : "",
      ...result.actions.map(a => `[${a.priority.toUpperCase()}] ${a.action}`),
      "",
      result.deadlines.length > 0 ? "DEADLINES:" : "",
      ...result.deadlines.map(d => `• ${d}`),
    ].filter(l => l !== undefined).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Interpreter</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste any Irish planning document — RFIs, conditions, observations, appeal decisions — and get a plain-English analysis with action items.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
          <select className={inputCls} value={docType} onChange={e => setDocType(e.target.value)} required>
            <option value="">Select document type…</option>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Text</label>
          <textarea
            className={`${inputCls} min-h-[220px] resize-y font-mono text-xs leading-relaxed`}
            value={docText}
            onChange={e => setDocText(e.target.value)}
            placeholder="Paste the full document text here…"
            required
          />
          <p className="text-xs text-gray-400 mt-1.5">{docText.trim().length} characters</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? "Analysing…" : "Interpret Document"}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Verdict banner */}
          <div className={`border rounded-2xl px-5 py-4 ${VERDICT_STYLE[result.verdictType]}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1">{VERDICT_LABEL[result.verdictType]}</p>
                <p className="text-sm font-medium">{result.verdict}</p>
              </div>
              <button
                onClick={copySummary}
                className="shrink-0 text-xs font-medium underline opacity-70 hover:opacity-100"
              >
                {copied ? "Copied!" : "Copy all"}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
          </div>

          {/* Deadlines */}
          {result.deadlines.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Deadlines</h3>
              <ul className="space-y-1.5">
                {result.deadlines.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {result.actions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Required Actions</h3>
              <div className="space-y-2">
                {result.actions.map((action, i) => (
                  <div key={i} className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${PRIORITY_STYLE[action.priority]}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[action.priority]}`} />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{action.priority}</span>
                      <p className="text-sm mt-0.5">{action.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
