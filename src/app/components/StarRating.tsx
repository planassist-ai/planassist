"use client";

// ─── StarRating — display and interactive star components ─────────────────────

interface StarDisplayProps {
  rating: number;       // e.g. 4.3
  count?: number;       // optional review count
  size?: "sm" | "md";
}

export function StarDisplay({ rating, count, size = "md" }: StarDisplayProps) {
  const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(n => {
          const fill = Math.min(1, Math.max(0, rating - (n - 1)));
          return (
            <svg
              key={n}
              className={`${starSize} shrink-0`}
              viewBox="0 0 20 20"
              fill="none"
            >
              <defs>
                <linearGradient id={`star-grad-${n}-${rating.toFixed(1)}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
                  <stop offset={`${fill * 100}%`} stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              <path
                d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z"
                fill={`url(#star-grad-${n}-${rating.toFixed(1)})`}
              />
            </svg>
          );
        })}
      </div>
      <span className={`font-semibold text-gray-800 ${textSize}`}>{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className={`text-gray-400 ${textSize}`}>({count})</span>
      )}
    </div>
  );
}

// ─── Interactive star picker ──────────────────────────────────────────────────

interface StarPickerProps {
  value: number;        // 0 = none selected
  onChange: (n: number) => void;
}

export function StarPicker({ value, onChange }: StarPickerProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="w-8 h-8 flex items-center justify-center rounded transition-transform hover:scale-110"
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <svg className="w-6 h-6" viewBox="0 0 20 20">
            <path
              d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z"
              fill={n <= value ? "#f59e0b" : "#d1d5db"}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
