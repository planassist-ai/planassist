"use client";

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_IS_DEMO !== "true") return null;

  return (
    <div className="w-full bg-yellow-400 text-yellow-900 px-4 py-2.5 flex items-center justify-between gap-4 text-sm font-medium" style={{ zIndex: 9999 }}>
      <div className="flex items-center gap-2 min-w-0">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span className="truncate">Demo Environment — data shown is for illustration purposes only</span>
      </div>
      <button
        onClick={() => { window.location.href = "/dashboard"; }}
        className="shrink-0 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-yellow-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        Reset Demo
      </button>
    </div>
  );
}
