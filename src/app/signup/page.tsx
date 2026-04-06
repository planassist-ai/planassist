"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

// ── Role selector ──────────────────────────────────────────────────────────────

function RoleSelector() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold text-green-600 tracking-tight">
            Granted
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome to Granted — who are you?
          </h1>
          <p className="mt-2 text-sm text-gray-500">We&apos;ll set up the right account for you.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Homeowner card */}
          <button
            onClick={() => router.push("/signup?type=homeowner")}
            className="group text-left bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl p-7 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center mb-5 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
              I am a homeowner planning a project
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Check if you need permission, track your application, and understand every planning document in plain English.
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
              Get started free
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>

          {/* Architect card */}
          <button
            onClick={() => router.push("/signup?type=architect")}
            className="group text-left bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-7 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-5 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
              I am an architect or planning professional
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Pipeline dashboard, RFI assistant, client updates, and deadline alerts across your entire practice.
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
              Request access
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>

        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium underline underline-offset-2 transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

// ── Signup form ────────────────────────────────────────────────────────────────

function SignupForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // All hooks must be declared before any conditional returns.
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [sent,            setSent]            = useState(false);

  // Derived values (not hooks — safe to compute anywhere).
  const typeParam   = searchParams.get("type");
  const isArchitect = typeParam === "architect";
  const isHomeowner = typeParam === "homeowner";
  const hasRole     = isArchitect || isHomeowner;

  // Early return after all hooks.
  if (!hasRole) {
    return <RoleSelector />;
  }

  const defaultNext = isArchitect ? "/dashboard" : "/my-planning";
  // Optional post-signup redirect — validated to relative paths only.
  const nextRaw     = searchParams.get("next") ?? "";
  const nextPath    = nextRaw.startsWith("/") && !nextRaw.startsWith("//") && nextRaw.length <= 300
    ? nextRaw
    : defaultNext;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const callbackUrl = isArchitect
      ? `${window.location.origin}/auth/callback?next=/dashboard&type=architect`
      : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      router.push(nextPath);
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Wordmark */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-green-600 tracking-tight">
            Granted
          </Link>
          <p className="mt-1 text-sm text-gray-500">Irish planning made simple</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {sent ? (
            /* ── Confirmation state ── */
            <div className="p-7 sm:p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Confirm your email</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                We&apos;ve sent a confirmation link to{" "}
                <span className="font-semibold text-gray-700">{email}</span>.
                Click the link to activate your account — it expires in 1 hour.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); setPassword(""); setConfirmPassword(""); }}
                className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* ── Signup form ── */
            <>
              {/* Role context banner */}
              <div className={`border-b px-7 py-4 ${isArchitect ? "bg-blue-50 border-blue-100" : "bg-green-50 border-green-100"}`}>
                <p className={`text-sm font-semibold mb-0.5 ${isArchitect ? "text-blue-800" : "text-green-800"}`}>
                  {isArchitect ? "Architect & Planning Professional account" : "Homeowner account"}
                </p>
                <p className={`text-xs leading-relaxed ${isArchitect ? "text-blue-700" : "text-green-700"}`}>
                  {isArchitect
                    ? "30-day free trial · Pipeline dashboard, RFI assistant, client updates, deadline alerts, and more."
                    : "Free to get started · Check permissions, track your application, and understand every document."}
                </p>
              </div>

              <div className="p-7 sm:p-8">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {isArchitect ? "Create your architect account" : "Join Granted"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isArchitect
                      ? "We'll be in touch to set up your practice and import your applications."
                      : "Your Irish planning companion — from first question to final decision."}
                  </p>
                </div>

                {error && (
                  <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
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
                        Creating account…
                      </>
                    ) : (
                      isArchitect ? "Create architect account" : "Create free account"
                    )}
                  </button>
                </form>

                <p className="mt-4 text-center">
                  <button
                    onClick={() => router.push("/signup")}
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                  >
                    ← Change role
                  </button>
                </p>

                <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
                  By signing up you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 transition-colors">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 transition-colors">Privacy Policy</Link>.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium underline underline-offset-2 transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
