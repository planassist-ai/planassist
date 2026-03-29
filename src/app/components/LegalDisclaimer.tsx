import Link from "next/link";

interface LegalDisclaimerProps {
  className?: string;
}

export function LegalDisclaimer({ className = "" }: LegalDisclaimerProps) {
  return (
    <div
      className={`flex gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 ${className}`}
      role="note"
      aria-label="Legal disclaimer"
    >
      <svg
        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
        />
      </svg>
      <p className="text-xs text-gray-500 leading-relaxed">
        This information is provided as general guidance only and does not constitute legal or
        planning advice. Planning regulations change frequently and vary by location. Always consult
        a qualified planning professional before making any decisions.{" "}
        <Link
          href="/terms#liability"
          className="underline underline-offset-2 hover:text-gray-600 transition-colors"
        >
          Granted accepts no liability
        </Link>{" "}
        for decisions made based on this guidance.
      </p>
    </div>
  );
}
