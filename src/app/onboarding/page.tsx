"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const COUNCILS = [
  "Carlow County Council",
  "Cavan County Council",
  "Clare County Council",
  "Cork City Council",
  "Cork County Council",
  "Donegal County Council",
  "Dublin City Council",
  "Dún Laoghaire-Rathdown County Council",
  "Fingal County Council",
  "Galway City Council",
  "Galway County Council",
  "Kerry County Council",
  "Kildare County Council",
  "Kilkenny County Council",
  "Laois County Council",
  "Leitrim County Council",
  "Limerick City & County Council",
  "Longford County Council",
  "Louth County Council",
  "Mayo County Council",
  "Meath County Council",
  "Monaghan County Council",
  "Offaly County Council",
  "Roscommon County Council",
  "Sligo County Council",
  "South Dublin County Council",
  "Tipperary County Council",
  "Waterford City & County Council",
  "Westmeath County Council",
  "Wexford County Council",
  "Wicklow County Council",
] as const;

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? "w-4 h-4"}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const inputCls =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

export default function OnboardingPage() {
  const router = useRouter();

  const [practiceName,    setPracticeName]    = useState("");
  const [architectEmail,  setArchitectEmail]  = useState("");
  const [ref,             setRef]             = useState("");
  const [client,          setClient]          = useState("");
  const [address,         setAddress]         = useState("");
  const [council,         setCouncil]         = useState("");
  const [subDate,         setSubDate]         = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create practice
      const profileRes = await fetch("/api/architect-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practiceName,
          architectEmail: architectEmail || undefined,
        }),
      });
      if (!profileRes.ok) {
        const d = await profileRes.json();
        throw new Error(d.error ?? "Failed to save practice details.");
      }
      const profileData = await profileRes.json();
      const newPracticeId = profileData.profile?.id ?? null;

      // 2. Create first application
      const appRes = await fetch("/api/planning-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: ref,
          clientName:      client,
          address,
          status:          "received",
          submissionDate:  subDate,
          council,
          practiceId:      newPracticeId,
        }),
      });
      if (!appRes.ok) {
        const d = await appRes.json();
        throw new Error(d.error ?? "Failed to save application.");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center">
          <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
            Granted
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-lg">

          {/* Welcome header */}
          <div className="mb-7 sm:mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Set up your practice
            </h1>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Add your practice details and first application to get started. Takes under a minute.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Practice section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Your Practice
              </h2>
              <div>
                <label className={labelCls} htmlFor="ob-practice">Practice name <span className="text-red-500">*</span></label>
                <input
                  id="ob-practice"
                  type="text"
                  value={practiceName}
                  onChange={e => setPracticeName(e.target.value)}
                  required
                  placeholder="e.g. Murphy Architecture Ltd"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="ob-arch-email">
                  Your email <span className="text-gray-400 font-normal">(for FI alerts)</span>
                </label>
                <input
                  id="ob-arch-email"
                  type="email"
                  value={architectEmail}
                  onChange={e => setArchitectEmail(e.target.value)}
                  placeholder="you@yourpractice.ie"
                  className={inputCls}
                />
              </div>
            </div>

            {/* First application section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                First Application
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="ob-ref">Reference number <span className="text-red-500">*</span></label>
                  <input
                    id="ob-ref"
                    type="text"
                    value={ref}
                    onChange={e => setRef(e.target.value)}
                    required
                    placeholder="e.g. DCC/2026/001234"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ob-council">Planning authority <span className="text-red-500">*</span></label>
                  <select
                    id="ob-council"
                    value={council}
                    onChange={e => setCouncil(e.target.value)}
                    required
                    className={inputCls + " appearance-none cursor-pointer"}
                  >
                    <option value="" disabled>Select authority…</option>
                    {COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="ob-client">Client name <span className="text-red-500">*</span></label>
                <input
                  id="ob-client"
                  type="text"
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  required
                  placeholder="e.g. John & Mary Smith"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="ob-address">Property address <span className="text-red-500">*</span></label>
                <input
                  id="ob-address"
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  placeholder="e.g. 12 Oak Avenue, Blackrock, Co. Dublin"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="ob-sub">Submission date <span className="text-red-500">*</span></label>
                <input
                  id="ob-sub"
                  type="date"
                  value={subDate}
                  onChange={e => setSubDate(e.target.value)}
                  required
                  className={inputCls}
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  The statutory decision deadline will be calculated automatically as 8 weeks from this date.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Setting up your dashboard…
                </>
              ) : (
                "Create my dashboard →"
              )}
            </button>

            <p className="text-center text-xs text-gray-400 pb-4">
              You can add more applications and edit details from the dashboard at any time.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
