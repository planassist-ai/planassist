"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HomeNav } from "@/app/components/HomeNav";
import { SiteFooter } from "@/app/components/SiteFooter";

// ─── Suggested questions ──────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "Does planning permission transfer with a land sale?",
  "What is an occupancy condition and does it affect who can buy my house?",
  "Do I need planning permission for a rear extension in Ireland?",
  "What is the local needs test and does it apply to my site?",
  "Can I build a house on agricultural land I own?",
  "What is retention permission and how do I apply for it?",
  "How long does planning permission last in Ireland?",
  "Can I appeal a planning decision and how long do I have?",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AskPage() {
  const [question, setQuestion]   = useState("");
  const [answer,   setAnswer]     = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState<string | null>(null);
  const [asked,    setAsked]      = useState(false);

  const answerRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to answer when it arrives
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [answer]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = question.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setAnswer("");

    try {
      const res = await fetch("/api/ask-planning", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setAnswer(data.answer ?? "");
      setAsked(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(q: string) {
    setQuestion(q);
    setAnswer("");
    setError(null);
    setAsked(false);
    textareaRef.current?.focus();
  }

  function handleNewQuestion() {
    setQuestion("");
    setAnswer("");
    setError(null);
    setAsked(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeNav />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Ask a Planning Question</h1>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Type any question about Irish planning law in plain English — permission requirements, local needs, occupancy conditions, appeals, exempted development, and more. Free for everyone, no login required.
            </p>
          </div>

          {/* Question form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="e.g. Does planning permission transfer when you sell land? What is an occupancy condition?"
                rows={4}
                maxLength={2000}
                className="w-full px-5 pt-4 pb-2 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <span className="text-xs text-gray-300">
                  {question.length > 0 ? `${question.length}/2000` : "Press ⌘ Enter to submit"}
                </span>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Thinking…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      Ask
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Answer */}
          {answer && (
            <div ref={answerRef} className="mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Answer header */}
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Planning guidance</span>
                </div>

                {/* Answer body */}
                <div className="px-5 py-5">
                  <div className="prose prose-sm prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {answer}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="px-5 py-3.5 bg-amber-50 border-t border-amber-100">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Guidance only.</strong> This is general planning information based on Irish planning law and policy. It is not legal advice and does not take the place of professional advice from a planning consultant or solicitor. Planning decisions depend on specific site circumstances, the current county development plan, and the judgement of the relevant planning authority.
                    {" "}<Link href="/find-a-professional" className="underline underline-offset-2 hover:text-amber-900">Find a planning professional</Link> if you need detailed advice for your situation.
                  </p>
                </div>
              </div>

              {/* Ask another */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleNewQuestion}
                  className="text-sm font-medium text-green-700 hover:text-green-800 underline underline-offset-2 transition-colors"
                >
                  Ask another question
                </button>
              </div>
            </div>
          )}

          {/* Suggested questions — hide once answered */}
          {!asked && !loading && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Common questions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSuggestion(q)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:border-green-300 hover:bg-green-50 transition-all leading-snug"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state with helpful message */}
          {loading && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">Checking Irish planning law… usually takes 5–10 seconds</p>
            </div>
          )}

          {/* Related tools */}
          {!loading && (
            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Specific planning tools
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Permission Checker",           href: "/check",               desc: "Step-by-step assessment for your project type" },
                  { label: "Document Interpreter",         href: "/interpreter",          desc: "Upload a planning document for a plain-English summary" },
                  { label: "Planning Statement Generator", href: "/planning-statement",   desc: "Generate a professional planning statement" },
                  { label: "County Intelligence",          href: "/check",                desc: "Approval rates and policy for your local council" },
                ].map(tool => (
                  <Link
                    key={tool.href + tool.label}
                    href={tool.href}
                    className="group flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-3.5 hover:border-green-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-green-800 transition-colors">{tool.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tool.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
