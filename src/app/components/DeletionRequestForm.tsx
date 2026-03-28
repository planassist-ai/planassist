"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function DeletionRequestForm() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-900 mb-1">
              Request received
            </p>
            <p className="text-sm text-green-800 leading-relaxed">
              We have recorded your deletion request and sent a confirmation to{" "}
              <strong>{email}</strong>. Your data will be deleted within{" "}
              <strong>30 days</strong> as required by GDPR. You will receive a
              follow-up email once it has been processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <label
          htmlFor="deletion-email"
          className="block text-sm font-medium text-gray-800 mb-1.5"
        >
          Your email address
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Enter the email address associated with your Planr account. We
          will send a confirmation to this address.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="deletion-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="you@example.com"
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-colors"
            disabled={status === "loading"}
            aria-describedby={status === "error" ? "deletion-error" : undefined}
          />
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            {status === "loading" ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Submitting…
              </>
            ) : (
              "Submit request"
            )}
          </button>
        </div>

        {status === "error" && errorMsg && (
          <p
            id="deletion-error"
            role="alert"
            className="mt-3 text-xs text-red-600 flex items-start gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            {errorMsg}
          </p>
        )}

        <p className="mt-4 text-xs text-gray-400 leading-relaxed">
          Requests are processed within 30 days as required by GDPR Article 17.
          You can also email us directly at{" "}
          <a
            href="mailto:hello@planassist.ie"
            className="text-green-600 underline underline-offset-2 hover:text-green-700"
          >
            hello@planassist.ie
          </a>
          .
        </p>
      </div>
    </form>
  );
}
