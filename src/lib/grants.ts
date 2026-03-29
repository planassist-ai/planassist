// ─── Shared SEAI grants data — 2026 amounts ───────────────────────────────────
// NOTE: Grant amounts are subject to change. Users should verify current
// amounts at seai.ie before applying.

export type GrantFlowType =
  | "new-build"
  | "extension"
  | "appearance"
  | "retrofit"
  | "self-build"
  | "replacement";

export interface SeaiGrant {
  id: string;
  name: string;
  amount: string;
  works: string;
  conditions: string[];
  url: string;
  applicableTo: GrantFlowType[];
  /** If true, not available for homes built after 2011 */
  requiresPre2011?: boolean;
  /** Works categories for the grants checker Q2 */
  worksCategory: "insulation" | "heating" | "solar" | "windows" | "ber";
}

export const SEAI_GRANTS: SeaiGrant[] = [
  {
    id: "heat-pump",
    name: "Heat Pump System",
    amount: "Up to €12,500",
    works: "Replacement of oil, gas or electric heating with an air-to-water or ground source heat pump",
    conditions: [
      "Home must be built before 2011",
      "Works must NOT start before grant approval letter is received — doing so forfeits the grant",
      "Must use an SEAI registered contractor",
      "Home must achieve a minimum B2 BER rating after works",
    ],
    url: "https://www.seai.ie/grants/home-energy-grants/heat-pump-grant/",
    applicableTo: ["extension", "retrofit"],
    requiresPre2011: true,
    worksCategory: "heating",
  },
  {
    id: "attic-insulation",
    name: "Attic Insulation",
    amount: "Up to €2,000",
    works: "Installation of attic or roof insulation to current standards",
    conditions: [
      "Home must be built before 2011",
      "Works must NOT start before grant approval letter is received",
      "Must use an SEAI registered contractor",
    ],
    url: "https://www.seai.ie/grants/home-energy-grants/insulation-grants/",
    applicableTo: ["extension", "retrofit"],
    requiresPre2011: true,
    worksCategory: "insulation",
  },
  {
    id: "cavity-wall",
    name: "Cavity Wall Insulation",
    amount: "Up to €1,800",
    works: "Injection of insulation material into existing cavity walls",
    conditions: [
      "Home must have an unfilled cavity wall construction",
      "Works must NOT start before grant approval letter is received",
      "Must use an SEAI registered contractor",
    ],
    url: "https://www.seai.ie/grants/home-energy-grants/insulation-grants/",
    applicableTo: ["extension", "retrofit"],
    requiresPre2011: false,
    worksCategory: "insulation",
  },
  {
    id: "solar-pv",
    name: "Solar PV Panels",
    amount: "Up to €1,800",
    works: "Installation of solar photovoltaic panels to generate electricity",
    conditions: [
      "Works must NOT start before grant approval letter is received",
      "Must use an SEAI registered contractor",
      "Available for both new and existing homes",
      "Micro-generation support scheme also available for excess electricity exported to the grid",
    ],
    url: "https://www.seai.ie/grants/home-energy-grants/solar-electricity-grant/",
    applicableTo: ["new-build", "extension", "retrofit", "self-build", "replacement"],
    requiresPre2011: false,
    worksCategory: "solar",
  },
  {
    id: "windows-doors",
    name: "Windows and Doors",
    amount: "New scheme — verify amount at seai.ie",
    works: "Replacement of single or poor-performing glazed windows and external doors with high-efficiency units",
    conditions: [
      "Works must NOT start before grant approval letter is received",
      "Must use an SEAI registered contractor",
      "New scheme launched March 2026 — verify current amounts at seai.ie before applying",
    ],
    url: "https://www.seai.ie/grants/home-energy-grants/",
    applicableTo: ["appearance", "extension", "retrofit"],
    requiresPre2011: false,
    worksCategory: "windows",
  },
  {
    id: "external-wall",
    name: "External Wall Insulation",
    amount: "Up to €8,000 (detached homes)",
    works: "External insulation system applied to outside walls, with render or cladding finish",
    conditions: [
      "Grant varies by dwelling type: detached €8,000, semi-detached €6,500, terraced / apartment €5,500",
      "Works must NOT start before grant approval letter is received",
      "Must use an SEAI registered contractor",
    ],
    url: "https://www.seai.ie/grants/home-energy-grants/insulation-grants/",
    applicableTo: ["appearance", "extension", "retrofit"],
    requiresPre2011: false,
    worksCategory: "insulation",
  },
  {
    id: "rafter-insulation",
    name: "Rafter Insulation",
    amount: "Up to €3,000",
    works: "Insulation fitted between or under roof rafters — for converted attics or rooms-in-roof",
    conditions: [
      "Home must be built before 2011",
      "Works must NOT start before grant approval letter is received",
      "Must use an SEAI registered contractor",
    ],
    url: "https://www.seai.ie/grants/home-energy-grants/insulation-grants/",
    applicableTo: ["extension", "retrofit"],
    requiresPre2011: true,
    worksCategory: "insulation",
  },
  {
    id: "ber",
    name: "BER Assessment",
    amount: "€200",
    works: "Building Energy Rating assessment and certificate — required for most SEAI grant applications",
    conditions: [
      "Must be carried out by an SEAI registered BER assessor",
      "BER assessment required before and after most energy upgrades",
      "Can be claimed as part of a broader energy upgrade application",
    ],
    url: "https://www.seai.ie/grants/home-energy-grants/ber-grant/",
    applicableTo: ["new-build", "extension", "retrofit", "self-build", "replacement", "appearance"],
    requiresPre2011: false,
    worksCategory: "ber",
  },
];

export function getGrantsForFlow(flowType: GrantFlowType): SeaiGrant[] {
  return SEAI_GRANTS.filter(g => g.applicableTo.includes(flowType));
}
