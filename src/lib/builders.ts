// ─── Shared types and display helpers for the builders directory ──────────────

export type TradeType =
  | "general_contractor"
  | "groundworks"
  | "extension_specialist"
  | "new_build_specialist"
  | "renovation_specialist"
  | "fit_out_specialist";

export interface Builder {
  id: string;
  company_name: string;
  contact_name: string;
  trade_types: string[];
  project_size_min: number | null;
  project_size_max: number | null;
  counties: string[];
  email: string;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
  insurance_confirmed: boolean;
  tax_compliant: boolean;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  // Merged from reviews
  avg_rating?: number;
  review_count?: number;
}

export interface Review {
  id: string;
  rating: number;
  review_text?: string | null;
  project_type?: string | null;
  county?: string | null;
  created_at: string;
}

export const TRADE_LABELS: Record<TradeType, string> = {
  general_contractor:   "General Contractor",
  groundworks:          "Groundworks Specialist",
  extension_specialist: "Extension Specialist",
  new_build_specialist: "New Build Specialist",
  renovation_specialist:"Renovation Specialist",
  fit_out_specialist:   "Fit-Out Specialist",
};

export const TRADE_OPTIONS: { value: TradeType; label: string }[] = [
  { value: "general_contractor",    label: "General Contractor" },
  { value: "groundworks",           label: "Groundworks Specialist" },
  { value: "extension_specialist",  label: "Extension Specialist" },
  { value: "new_build_specialist",  label: "New Build Specialist" },
  { value: "renovation_specialist", label: "Renovation Specialist" },
  { value: "fit_out_specialist",    label: "Fit-Out Specialist" },
];

export const PROJECT_SIZE_OPTIONS: { value: number; label: string }[] = [
  { value: 0,       label: "€0" },
  { value: 25000,   label: "€25,000" },
  { value: 50000,   label: "€50,000" },
  { value: 100000,  label: "€100,000" },
  { value: 150000,  label: "€150,000" },
  { value: 250000,  label: "€250,000" },
  { value: 300000,  label: "€300,000" },
  { value: 500000,  label: "€500,000" },
  { value: 1000000, label: "€1,000,000+" },
];

export function formatProjectSize(min: number | null, max: number | null): string {
  const fmt = (n: number) =>
    n >= 1000000 ? "€1M+" : `€${(n / 1000).toFixed(0)}k`;
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
  if (min !== null) return `From ${fmt(min)}`;
  if (max !== null) return `Up to ${fmt(max)}`;
  return "Any size";
}
