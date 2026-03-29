import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple header */}
      <header className="border-b border-gray-100 px-6 h-16 flex items-center">
        <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
          Granted
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
            404 — Page not found
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            This page doesn&apos;t exist
          </h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            The page you&apos;re looking for may have been moved, renamed, or
            removed. Head back to the homepage to get started.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to homepage
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <footer className="border-t border-gray-100 px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          Granted — AI-powered planning guidance for Ireland
        </p>
      </footer>
    </div>
  );
}
