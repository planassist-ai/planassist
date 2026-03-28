import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-gray-100 bg-white px-4 sm:px-6 py-8">
      {/* ── Top row: brand + links ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

        {/* Brand */}
        <div className="shrink-0">
          <p className="text-sm font-bold text-green-600 tracking-tight leading-none mb-1">
            PlanAssist
          </p>
          <p className="text-xs text-gray-500">Your local planning assistant</p>
        </div>

        {/* Links */}
        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
          aria-label="Footer navigation"
        >
          <Link
            href="/privacy"
            className="text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            Terms of Service
          </Link>
          <a
            href="mailto:hello@planassist.ie"
            className="text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            hello@planassist.ie
          </a>
        </nav>
      </div>

      {/* ── Bottom row: disclaimer + copyright ───────────── */}
      <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <p className="text-xs text-gray-400">
          Planning guidance only — not legal advice.
        </p>
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} PlanAssist
        </p>
      </div>
    </footer>
  );
}
