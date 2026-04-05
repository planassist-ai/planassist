"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { HomeNav } from "@/app/components/HomeNav";
import { SiteFooter } from "@/app/components/SiteFooter";
import { createClient } from "@/lib/supabase/browser";

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

// ─── Markdown renderer ────────────────────────────────────────────────────────

function PlanningAnswer({ content }: { content: string }) {
  return (
    <div className="planning-answer">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-gray-900 mt-5 mb-2 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-gray-900 mt-5 mb-2 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-gray-800 mt-4 mb-1.5 first:mt-0">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 space-y-1.5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 space-y-1.5 list-decimal list-inside last:mb-0">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-green-300 pl-4 my-3 text-sm text-gray-600 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-gray-100 my-4" />,
          a: ({ href, children }) => (
            <a href={href} className="text-green-700 underline underline-offset-2 hover:text-green-800 transition-colors" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── Feedback buttons ─────────────────────────────────────────────────────────

function FeedbackButtons({ question, answer }: { question: string; answer: string }) {
  const [voted, setVoted]     = useState<"up" | "down" | null>(null);
  const [saving, setSaving]   = useState(false);

  async function handleVote(vote: "up" | "down") {
    if (voted || saving) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("ask_feedback").insert({
        question,
        answer,
        helpful: vote === "up",
      });
      setVoted(vote);
    } catch {
      // Fail silently — feedback is best-effort
      setVoted(vote);
    } finally {
      setSaving(false);
    }
  }

  if (voted) {
    return (
      <p className="text-xs text-gray-400">
        {voted === "up" ? "Thanks — glad that was helpful." : "Thanks for the feedback. We'll use it to improve."}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-400 mr-1">Was this helpful?</span>
      <button
        onClick={() => handleVote("up")}
        disabled={saving}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
        aria-label="Yes, helpful"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
        </svg>
        Yes
      </button>
      <button
        onClick={() => handleVote("down")}
        disabled={saving}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        aria-label="No, not helpful"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
        </svg>
        No
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer,   setAnswer]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [asked,    setAsked]    = useState(false);
  const [askedQuestion, setAskedQuestion] = useState("");

  const answerRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setAskedQuestion(q);

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
    setTimeout(() => textareaRef.current?.focus(), 50);
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

                {/* Answer body — rendered markdown */}
                <div className="px-5 py-5">
                  <PlanningAnswer content={answer} />
                </div>

                {/* Disclaimer */}
                <div className="mx-5 mb-5 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>This is AI-generated guidance.</strong> Always verify with a registered architect or your local planning authority for complex or high-value projects.{" "}
                      <Link href="/find-a-professional" className="underline underline-offset-2 hover:text-amber-900 transition-colors">
                        Find a planning professional
                      </Link>{" "}
                      if your situation is complex.
                    </p>
                  </div>
                </div>

                {/* Footer row — feedback + branding */}
                <div className="px-5 pb-4 flex items-center justify-between gap-4 flex-wrap">
                  <FeedbackButtons question={askedQuestion} answer={answer} />
                  <p className="text-xs text-gray-300 shrink-0">
                    Powered by Granted Planning Intelligence
                  </p>
                </div>
              </div>

              {/* Ask another */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleNewQuestion}
                  className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 bg-white border border-green-200 hover:border-green-300 px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
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

          {/* Loading state */}
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
                  { label: "Permission Checker",           href: "/check",             desc: "Step-by-step assessment for your project type" },
                  { label: "Document Interpreter",         href: "/interpreter",        desc: "Upload a planning document for a plain-English summary" },
                  { label: "Planning Statement Generator", href: "/planning-statement", desc: "Generate a professional planning statement" },
                  { label: "Application Status Checker",   href: "/status",             desc: "Understand where you are in the planning process" },
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
