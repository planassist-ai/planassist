"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [sent, setSent]                       = useState(false);

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
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/planning-tools`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      router.push("/planning-tools");
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
              {/* Value prop banner */}
              <div className="bg-green-50 border-b border-green-100 px-7 py-5">
                <p className="text-sm font-semibold text-green-800 mb-3">
                  Join Granted — free to sign up
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-green-800 mb-0.5">Homeowners</p>
                      <p className="text-xs text-green-700 leading-relaxed">
                        Get full access to all planning tools — monitor your application, interpret documents and access county intelligence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-green-800 mb-0.5">Architects &amp; Professionals</p>
                      <p className="text-xs text-green-700 leading-relaxed">
                        Get full access to the professional dashboard — manage your pipeline, automate client updates and access all planning tools. Plans start from €99/month after your free trial.
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        60-day free trial — no card required to start.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-7 sm:p-8">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
                  <p className="text-sm text-gray-500">
                    Free to sign up. Unlock all tools after your trial.
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
                      "Create free account"
                    )}
                  </button>
                </form>

                <p className="mt-5 text-xs text-gray-400 text-center leading-relaxed">
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
