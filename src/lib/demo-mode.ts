/**
 * Demo mode helpers — safe to import anywhere in the app.
 *
 * When NEXT_PUBLIC_IS_DEMO=true:
 *   - isDemoMode()       returns true
 *   - isFeatureEnabled() returns true (all features unlocked regardless of subscription tier)
 *
 * When the env var is absent or false, both functions return false and the app
 * behaves exactly as normal production code — no side-effects whatsoever.
 */

/** Returns true when running in demo mode (NEXT_PUBLIC_IS_DEMO=true). */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_IS_DEMO === "true";
}

/**
 * Returns true if a feature should be considered enabled for the current request.
 * In demo mode every feature is unlocked; in production this always returns false
 * (real tier checks in useAuthStatus / resolveUserTier govern access instead).
 */
export function isFeatureEnabled(): boolean {
  return isDemoMode();
}
