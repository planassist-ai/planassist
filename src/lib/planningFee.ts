// ─── Planning fee calculator ──────────────────────────────────────────────────
// Fees are based on the Planning & Development Regulations 2001, Schedule 5,
// as amended. Always verify against the current statutory instrument.

export type DevTypeKey =
  | "house_extension"
  | "new_dwelling"
  | "change_of_use"
  | "retention"
  | "outline_permission"
  | "other";

export const DEV_TYPES: { value: DevTypeKey; label: string }[] = [
  { value: "house_extension",    label: "House Extension" },
  { value: "new_dwelling",       label: "New Dwelling" },
  { value: "change_of_use",      label: "Change of Use" },
  { value: "retention",          label: "Retention" },
  { value: "outline_permission", label: "Outline Permission" },
  { value: "other",              label: "Other Development" },
];

export interface FeeResult {
  fee: number;
  breakdown: string[];
  note?: string;
}

export function euro(n: number) {
  return n.toLocaleString("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

export function calculatePlanningFee(devType: DevTypeKey, area: number): FeeResult {
  const min = 34;
  switch (devType) {
    case "house_extension": {
      const raw = Math.round(area * 34);
      const fee = Math.max(min, Math.min(raw, 1360));
      return {
        fee,
        breakdown: [
          `Floor area: ${area} sq m`,
          `Rate: ${euro(34)} per sq m  (Schedule 5, Class 1 — Residential Extension)`,
          raw > 1360
            ? `Subtotal ${area} × ${euro(34)} = ${euro(raw)}, capped at maximum ${euro(1360)}`
            : `${area} × ${euro(34)} = ${euro(fee)}`,
        ],
        note: "The maximum fee for a residential extension is €1,360 (equivalent to 40 sq m). Floor area beyond 40 sq m attracts no additional fee.",
      };
    }
    case "new_dwelling": {
      const fee = Math.max(min, Math.round(area * 65));
      return {
        fee,
        breakdown: [
          `Floor area: ${area} sq m`,
          `Rate: ${euro(65)} per sq m  (Schedule 5, Class 1 — New Dwelling)`,
          `${area} × ${euro(65)} = ${euro(fee)}`,
        ],
      };
    }
    case "change_of_use": {
      const fee = Math.max(min, Math.round(area * 80));
      return {
        fee,
        breakdown: [
          `Floor area: ${area} sq m`,
          `Rate: ${euro(80)} per sq m  (Schedule 5, Class 3 — Change of Use)`,
          `${area} × ${euro(80)} = ${euro(fee)}`,
        ],
      };
    }
    case "retention": {
      const fee = Math.max(min, Math.round(area * 80));
      return {
        fee,
        breakdown: [
          `Floor area: ${area} sq m`,
          `Rate: ${euro(80)} per sq m  (Schedule 5 — Retention Application)`,
          `${area} × ${euro(80)} = ${euro(fee)}`,
        ],
        note: "Retention applications use the standard fee schedule. Fees are not multiplied for retention.",
      };
    }
    case "outline_permission": {
      const fee = Math.max(min, Math.round(area * 65));
      return {
        fee,
        breakdown: [
          `Floor area: ${area} sq m`,
          `Rate: ${euro(65)} per sq m  (Schedule 5 — Outline Permission)`,
          `${area} × ${euro(65)} = ${euro(fee)}`,
        ],
        note: "If outline permission is granted, a separate (top-up) fee is payable when lodging the subsequent full application.",
      };
    }
    default: {
      const fee = Math.max(min, Math.round(area * 80));
      return {
        fee,
        breakdown: [
          `Floor area: ${area} sq m`,
          `Rate: ${euro(80)} per sq m  (Schedule 5)`,
          `${area} × ${euro(80)} = ${euro(fee)}`,
        ],
      };
    }
  }
}
