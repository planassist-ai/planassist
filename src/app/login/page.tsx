"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const hasError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    hasError ? "The login link was invalid or has expired. Please request a new one." : null
  );

  // Redirect if already logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.href = next;
    });
  }, [next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-md">

        {/* Wordmark */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-green-600 tracking-tight">
            PlanAssist
          </Link>
          <p className="mt-1 text-sm text-gray-500">Irish planning made simple</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-7 sm:p-8 shadow-sm">

          {sent ? (
            /* ── Confirmation state ── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                We&apos;ve sent a login link to{" "}
                <span className="font-semibold text-gray-700">{email}</span>.
                Click the link in the email to sign in — it&apos;s valid for 1 hour.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* ── Login form ── */
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
                <p className="text-sm text-gray-500">
                  Enter your email and we&apos;ll send you a secure login link — no password needed.
                </p>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-colors text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending link…
                    </>
                  ) : (
                    "Send login link"
                  )}
                </button>
              </form>

              <p className="mt-5 text-xs text-gray-400 text-center leading-relaxed">
                By signing in you agree to our{" "}
                <span className="underline underline-offset-2 cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
              </p>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 underline underline-offset-2 transition-colors">
            Back to PlanAssist
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
