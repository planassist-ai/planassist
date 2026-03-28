"use client";

import { useEffect } from "react";

// global-error replaces the root layout, so html/body must be included.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: "#fef2f2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#f87171"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem", maxWidth: 400 }}>
            An unexpected error occurred. Please refresh the page — if the problem
            continues, contact support.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.5rem",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "0.625rem 1.5rem",
                background: "#fff",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Go to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
