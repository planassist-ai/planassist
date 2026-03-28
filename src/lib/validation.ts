import { NextResponse } from "next/server";

// ─── Irish county names (for check-permission) ────────────────────────────────

export const VALID_IRISH_COUNTIES = new Set([
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin",
  "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim",
  "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan",
  "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford",
  "Westmeath", "Wexford", "Wicklow",
]);

// ─── Irish planning authorities (for check-status / monitor-application) ──────
// Matches the values used in status/page.tsx.

export const VALID_IRISH_AUTHORITIES = new Set([
  "Carlow", "Cavan", "Clare",
  "Cork City", "Cork County",
  "Donegal",
  "Dublin City", "Dún Laoghaire-Rathdown", "Fingal", "South Dublin",
  "Galway City", "Galway County",
  "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim",
  "Limerick City and County", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo",
  "Tipperary",
  "Waterford City and County",
  "Westmeath", "Wexford", "Wicklow",
]);

// ─── Valid planning application statuses ──────────────────────────────────────

export const VALID_PLANNING_STATUSES = new Set([
  "received", "validation", "on_display", "under_assessment",
  "further_info", "decision_pending", "granted", "refused", "appeal",
]);

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_TEXT_AREA_CHARS = 5000;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
// %PDF- in bytes
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);

// ─── Suspicious content patterns ─────────────────────────────────────────────
// Targeted at clear injection attacks; scoped to avoid false positives in
// legitimate Irish planning document text.

const SUSPICIOUS_PATTERNS: RegExp[] = [
  // SQL injection — boolean tricks, destructive DDL, UNION, EXEC
  /'\s*(OR|AND)\s+['"\d]/i,
  /;\s*(DROP|DELETE|TRUNCATE|ALTER|CREATE)\s+/i,
  /\bUNION\s+(ALL\s+)?SELECT\b/i,
  /\bEXECUTE?\s*\(/i,
  /\bxp_cmdshell\b/i,
  // XSS / HTML injection
  /<script[\s>/]/i,
  /<\/script>/i,
  /javascript\s*:/i,
  /<iframe[\s>/]/i,
  /\bon(load|error|click|submit|focus|mouseover)\s*=/i,
  // Null bytes
  /\x00/,
];

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Validate a county name against VALID_IRISH_COUNTIES (for check-permission).
 * Returns an error message or null.
 */
export function validateCounty(county: unknown): string | null {
  if (typeof county !== "string" || !county.trim()) {
    return "County is required.";
  }
  const trimmed = county.trim();
  if (trimmed.length > 50) {
    return "County name must be 50 characters or fewer.";
  }
  // Normalise to Title Case for a case-insensitive match
  const normalised = trimmed
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  if (!VALID_IRISH_COUNTIES.has(normalised)) {
    return `"${trimmed}" is not a recognised Irish county. Please select a valid county.`;
  }
  return null;
}

/**
 * Validate a planning authority name against VALID_IRISH_AUTHORITIES
 * (for check-status and monitor-application).
 * Returns an error message or null.
 */
export function validateAuthority(authority: unknown): string | null {
  if (typeof authority !== "string" || !authority.trim()) {
    return "County / planning authority is required.";
  }
  const trimmed = authority.trim();
  if (trimmed.length > 50) {
    return "County name must be 50 characters or fewer.";
  }
  if (!VALID_IRISH_AUTHORITIES.has(trimmed)) {
    return `"${trimmed}" is not a recognised Irish planning authority. Please select a valid county.`;
  }
  return null;
}

/**
 * Validate a text-area field: must be a string and at most maxLength characters.
 * Returns an error message or null.
 */
export function validateTextArea(
  value: unknown,
  fieldName: string,
  maxLength = MAX_TEXT_AREA_CHARS,
): string | null {
  if (typeof value !== "string") {
    return `${fieldName} must be a text value.`;
  }
  if (value.trim().length > maxLength) {
    return `${fieldName} must be ${maxLength.toLocaleString()} characters or fewer.`;
  }
  return null;
}

/**
 * Validate an Irish planning reference number (e.g. DCC/2025/04821, PL04B/2025/1205).
 * Format: PREFIX/YYYY/NNNNN where PREFIX is 2–8 uppercase letters/digits.
 * Returns an error message or null.
 */
export function validatePlanningRef(ref: unknown): string | null {
  if (typeof ref !== "string" || !ref.trim()) {
    return "Planning reference number is required.";
  }
  const trimmed = ref.trim();
  if (trimmed.length > 30) {
    return "Planning reference number must be 30 characters or fewer.";
  }
  if (!/^[A-Z][A-Z0-9]{0,7}\/\d{4}\/\d{3,6}$/i.test(trimmed)) {
    return "Planning reference number must be in standard Irish format, e.g. DCC/2025/01234.";
  }
  return null;
}

/**
 * Check whether a buffer starts with the PDF magic bytes (%PDF-).
 * Returns true if the file is a genuine PDF.
 */
export function isPDFMagicBytes(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.slice(0, 5).equals(PDF_MAGIC);
}

/**
 * Check that a file size in bytes is within the 10 MB limit.
 * Returns an error message or null.
 */
export function validateFileSize(bytes: number): string | null {
  if (bytes > MAX_FILE_BYTES) {
    return "File must be under 10 MB. Please reduce the file size and try again.";
  }
  return null;
}

/**
 * Scan a string for SQL injection, XSS, and other injection patterns.
 * Returns a plain-English error message if suspicious content is found, null otherwise.
 */
export function containsSuspiciousContent(text: string): string | null {
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      return "Your input contains characters or patterns that are not allowed. Please remove any special characters or HTML and try again.";
    }
  }
  return null;
}

/**
 * Scan multiple text fields for suspicious content.
 * Returns the first error found, or null if all fields are clean.
 */
export function scanFields(...texts: (string | undefined | null)[]): string | null {
  for (const text of texts) {
    if (text) {
      const err = containsSuspiciousContent(text);
      if (err) return err;
    }
  }
  return null;
}

/** Return a 400 Bad Request response with a plain English message. */
export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}
