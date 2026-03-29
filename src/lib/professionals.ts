// ─── Shared types and display helpers for the professionals directory ──────────

export type ProfessionType =
  | "architect"
  | "architectural_technologist"
  | "planning_consultant"
  | "civil_engineer"
  | "land_agent"
  | "solicitor";

export type Specialism =
  | "rural_new_build"
  | "extension"
  | "commercial"
  | "protected_structure"
  | "agricultural"
  | "retention"
  | "change_of_use";

export interface Professional {
  id: string;
  name: string;
  practice_name: string;
  profession_type: ProfessionType;
  email?: string;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
  counties: string[];
  specialisms: string[];
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  // Merged from reviews
  avg_rating?: number | null;
  review_count?: number;
}

export const PROFESSION_LABELS: Record<ProfessionType, string> = {
  architect:                   "Architect",
  architectural_technologist:  "Architectural Technologist",
  planning_consultant:         "Planning Consultant",
  civil_engineer:              "Civil Engineer",
  land_agent:                  "Land Agent",
  solicitor:                   "Solicitor (Planning)",
};

export const PROFESSION_COLORS: Record<ProfessionType, string> = {
  architect:                   "bg-blue-100 text-blue-700 border-blue-200",
  architectural_technologist:  "bg-indigo-100 text-indigo-700 border-indigo-200",
  planning_consultant:         "bg-green-100 text-green-700 border-green-200",
  civil_engineer:              "bg-amber-100 text-amber-700 border-amber-200",
  land_agent:                  "bg-orange-100 text-orange-700 border-orange-200",
  solicitor:                   "bg-purple-100 text-purple-700 border-purple-200",
};

export const SPECIALISM_LABELS: Record<Specialism, string> = {
  rural_new_build:   "Rural New Build",
  extension:         "Extension / Renovation",
  commercial:        "Commercial",
  protected_structure: "Protected Structure",
  agricultural:      "Agricultural",
  retention:         "Retention",
  change_of_use:     "Change of Use",
};

export const PROFESSION_OPTIONS: { value: ProfessionType; label: string }[] = [
  { value: "architect",                  label: "Architect" },
  { value: "architectural_technologist", label: "Architectural Technologist" },
  { value: "planning_consultant",        label: "Planning Consultant" },
  { value: "civil_engineer",             label: "Civil Engineer" },
  { value: "land_agent",                 label: "Land Agent" },
  { value: "solicitor",                  label: "Solicitor (Planning)" },
];

export const SPECIALISM_OPTIONS: { value: Specialism; label: string }[] = [
  { value: "rural_new_build",    label: "Rural New Build" },
  { value: "extension",          label: "Extension / Renovation" },
  { value: "commercial",         label: "Commercial" },
  { value: "protected_structure", label: "Protected Structure" },
  { value: "agricultural",       label: "Agricultural" },
  { value: "retention",          label: "Retention" },
  { value: "change_of_use",      label: "Change of Use" },
];

export const COUNTIES = [
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry",
  "Kildare","Kilkenny","Laois","Leitrim","Limerick","Longford","Louth",
  "Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary",
  "Waterford","Westmeath","Wexford","Wicklow",
];
