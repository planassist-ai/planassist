import { NextRequest, NextResponse } from "next/server";

const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store — resets when the server process restarts.
// In serverless environments each cold start gets a fresh store, which is
// acceptable for a simple free-tier rate limit.
const store = new Map<string, RateLimitEntry>();

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/**
 * Check the rate limit for this request.
 * Returns a 429 NextResponse if the limit is exceeded, otherwise null.
 */
export function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = getIp(request);
  const now = Date.now();

  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    // First request in this window (or window has expired — reset)
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (entry.count >= LIMIT) {
    return NextResponse.json(
      {
        error:
          "You have reached the limit for free requests. Please try again in an hour or upgrade your account to continue.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count += 1;
  return null;
}
