"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PolicyItem  { title: string; detail: string }
interface WarningItem { text: string }
interface LinkItem    { label: string; url: string }

interface CountyData {
  countyName: string;
  policies:   PolicyItem[];
  warnings:   WarningItem[];
  links:      LinkItem[];
}

// ── County data ───────────────────────────────────────────────────────────────
// Sourced from County Development Plans, Planning and Development Act 2000 (as amended),
// and Sustainable Rural Housing Guidelines.

const COUNTIES: Record<string, CountyData> = {
  Carlow: {
    countyName: "Carlow",
    policies: [
      { title: "Rural Housing — Local Needs", detail: "Carlow CDP requires genuine local need for one-off rural dwellings. Distinguishes family connection, agricultural employment, and other rural needs. Commuter pressure from Dublin M9 corridor means eastern zones face stricter scrutiny." },
      { title: "Commuter Pressure Zones",     detail: "Eastern Carlow and Carlow town environs designated as under commuter pressure. Rural housing policy applied more strictly to prevent ribbon development along rural roads." },
      { title: "Heritage & Landscape",        detail: "Areas near Brownshill Dolmen and the Barrow Valley have heightened heritage assessment requirements. Visual impact assessments required adjacent to scenic routes." },
    ],
    warnings: [
      { text: "Significant proportion of decisions go to oral hearing at An Bord Pleanála in sensitive areas." },
      { text: "Third-party observations are common on rural one-off housing applications in the eastern commuter belt." },
    ],
    links: [
      { label: "Carlow County Development Plan", url: "https://www.carlow.ie/planning/county-development-plan/" },
      { label: "Carlow Planning Portal",          url: "https://www.carlow.ie/planning/" },
    ],
  },
  Cork: {
    countyName: "Cork",
    policies: [
      { title: "Dual Authority Structure",   detail: "Cork operates two planning authorities: Cork City Council and Cork County Council. City boundary expansion in 2019 transferred significant suburban areas to the city. Confirm correct authority before submitting." },
      { title: "Rural Housing Zones",        detail: "Cork County CDP defines Strong Rural Areas, Structurally Weak Areas, and Rural Areas under Urban Influence. Policies differ significantly — applicants in Urban Influence zones must demonstrate stronger local need." },
      { title: "Design Standards",           detail: "Cork is among the most design-conscious authorities in Ireland. Pre-application consultations strongly recommended for larger schemes. Urban Design Frameworks apply in Cork City." },
    ],
    warnings: [
      { text: "Cork City Council has a detailed Supplementary Planning Guidance library — check for relevant SPGs before lodging." },
      { text: "Processing times in Cork County can exceed 8 weeks in busier offices. Build in contingency." },
    ],
    links: [
      { label: "Cork County Development Plan", url: "https://www.corkcoco.ie/planning/county-development-plan" },
      { label: "Cork City Development Plan",   url: "https://www.corkcity.ie/en/planning/" },
    ],
  },
  Dublin: {
    countyName: "Dublin",
    policies: [
      { title: "Four-Authority Structure",   detail: "Greater Dublin has four planning authorities: Dublin City Council, Fingal County Council, South Dublin County Council, and Dún Laoghaire-Rathdown County Council. Each has its own development plan and policies." },
      { title: "Urban Design & Density",    detail: "All Dublin authorities apply the Apartment Guidelines 2020 and Urban Development and Building Heights Guidelines. Medium-to-high density supported near transport corridors. Design quality scrutinised closely." },
      { title: "Strategic Housing",         detail: "Large residential schemes (100+ units) are dealt with as LARDs (Large-scale Residential Developments) directly to An Bord Pleanála under Planning and Development Act 2024 provisions." },
    ],
    warnings: [
      { text: "Third-party observation rates are very high across all Dublin authorities — particularly for residential developments." },
      { text: "Archaeology is a consideration across much of Dublin City. Pre-application archaeological assessment advice is recommended." },
    ],
    links: [
      { label: "Dublin City Council Planning",     url: "https://www.dublincity.ie/planning" },
      { label: "Fingal County Council Planning",   url: "https://www.fingal.ie/planning" },
      { label: "South Dublin Planning",            url: "https://www.sdcc.ie/planning" },
      { label: "Dún Laoghaire-Rathdown Planning",  url: "https://www.dlrcoco.ie/planning" },
    ],
  },
  Galway: {
    countyName: "Galway",
    policies: [
      { title: "City vs County",             detail: "Galway City Council and Galway County Council are separate planning authorities. The city boundary is under long-running review. Development proposals near the boundary require careful authority identification." },
      { title: "Gaeltacht Areas",            detail: "Significant portions of Galway County are within Irish-language Gaeltacht areas. Cultural and linguistic impact is a material consideration. Some SPCAs (Special Planning Control Areas) apply. Udarás na Gaeltachta should be notified for certain development types." },
      { title: "Flood Risk",                 detail: "Extensive flood risk mapping applies along the Corrib, Suck, and Clarin rivers and Galway Bay coastline. Stage 1 flood risk assessment required for most new development outside Zone A/B exclusions." },
    ],
    warnings: [
      { text: "Galway City has acute housing pressure — higher density schemes are actively encouraged near public transport." },
      { text: "Observational rate is high for rural one-off housing in scenic Connemara and Aran Island areas." },
    ],
    links: [
      { label: "Galway City Council Planning",   url: "https://www.galwaycity.ie/planning" },
      { label: "Galway County Council Planning", url: "https://www.galwaycoco.ie/planning" },
    ],
  },
  Kerry: {
    countyName: "Kerry",
    policies: [
      { title: "Tourism & Scenic Landscapes",  detail: "Kerry CDP places strong emphasis on protecting scenic landscapes, particularly in the Ring of Kerry, Dingle Peninsula, and Killarney National Park environs. Visual impact assessments are routinely required for rural development in designated scenic areas." },
      { title: "Rural Housing Policy",         detail: "Kerry is a Structurally Weak rural area. A more permissive approach applies for persons who can demonstrate an economic or social need to live in the rural area, or a return to their family's home place." },
      { title: "Coastal Development",          detail: "Coastal Protection Zones apply along the Kerry coastline. Development within 300m of the high water mark requires detailed flood risk assessment and may be restricted to uses requiring a coastal location." },
    ],
    warnings: [
      { text: "SHDs (Strategic Housing Developments) and LARDs proceed directly to An Bord Pleanála." },
      { text: "Heritage and biodiversity assessments are frequently requested in upland and coastal zones." },
    ],
    links: [
      { label: "Kerry County Development Plan", url: "https://www.kerrycoco.ie/planning/" },
    ],
  },
  Kildare: {
    countyName: "Kildare",
    policies: [
      { title: "Commuter Belt Restrictions",  detail: "Kildare is one of the strongest commuter-belt counties. Rural housing policy is strictly applied — genuine local need must be clearly established. Return to home area applications are assessed carefully against planning history." },
      { title: "Flood Risk",                  detail: "The Liffey, Barrow, and Grand Canal catchments create extensive SFRA (Strategic Flood Risk Assessment) mapping. Sequential test applies for any development in flood zone A or B." },
      { title: "Settled Traveller Community", detail: "Kildare has one of the largest Traveller populations. Halting site and standard accommodation proposals must meet specific CDP policies and the National Traveller Accommodation Programme." },
    ],
    warnings: [
      { text: "Kildare is a popular commuter county with consistently high application volumes. Expect longer processing timelines in busy periods." },
      { text: "Significant proportion of rural one-off refusals cite failure to demonstrate local need and ribbon development concerns." },
    ],
    links: [
      { label: "Kildare County Development Plan", url: "https://www.kildarecoco.ie/planning/" },
    ],
  },
  Limerick: {
    countyName: "Limerick",
    policies: [
      { title: "City and County Merger",      detail: "Limerick City and County Council merged in 2014 — a single planning authority. Limerick 2030 Plan drives urban regeneration in the city. Rural policy varies by area designation in the CDP." },
      { title: "Regeneration Areas",          detail: "Several urban areas in Limerick City have Regeneration Area status with specific planning guidance. Development within these areas may benefit from relaxed density or car parking requirements." },
      { title: "Shannon Flood Risk",          detail: "Extensive Shannon floodplain applies along the western edge of Limerick City. SFRA and sequential test required. Significant infrastructure projects on the flood plain require specific EIA." },
    ],
    warnings: [
      { text: "Limerick 2030 Economic and Spatial Plan has strong support for mixed-use development in the city core." },
      { text: "Industrial and logistics development near Shannon Airport / National Technology Park area is actively facilitated." },
    ],
    links: [
      { label: "Limerick City and County Council Planning", url: "https://www.limerick.ie/council/services/planning" },
    ],
  },
  Meath: {
    countyName: "Meath",
    policies: [
      { title: "Boyne Valley Heritage Corridor", detail: "The Brú na Bóinne World Heritage Site and surrounding Boyne Valley require heightened heritage impact assessment for any development within the buffer zone or wider setting. Visual impact and archaeological assessment are mandatory." },
      { title: "Commuter Belt Policy",            detail: "Meath is a highly active commuter county. Rural housing policy strictly controls development beyond settlement boundaries. The R1/R2 rural area classification determines the stringency of local needs tests." },
      { title: "Infrastructure-Led Growth",       detail: "Development near Navan, Trim, and Drogheda is encouraged where infrastructure is in place. Meath CDP supports higher density near rail stations (Dunboyne Line) to maximise sustainable transport." },
    ],
    warnings: [
      { text: "Archaeological notifications are extremely common across County Meath — RMP entries cover a very high proportion of the county." },
      { text: "Third-party observation rates are high for residential development in commuter towns." },
    ],
    links: [
      { label: "Meath County Development Plan", url: "https://www.meath.ie/council/planning/county-development-plan/" },
    ],
  },
  Wicklow: {
    countyName: "Wicklow",
    policies: [
      { title: "Wicklow Mountains National Park", detail: "Significant portions of the county are within or adjacent to Wicklow Mountains National Park. Development near the park boundary requires ecological impact assessment and must demonstrate no adverse effect on park integrity." },
      { title: "Dublin Commuter Pressure",        detail: "Northern Wicklow (Bray, Greystones, Kilcoole corridor) experiences the highest commuter pressure outside Dublin. Rural housing policy strictly applied. Ribbon development a persistent concern along the N11 corridor." },
      { title: "Coastal Zone",                    detail: "Wicklow coastline is subject to ICZM (Integrated Coastal Zone Management) policies. Flood risk assessment required within coastal development setback zones." },
    ],
    warnings: [
      { text: "Wicklow sees very high third-party observation rates for rural development, particularly near the N11 and in north Wicklow villages." },
      { text: "Habitat mapping and appropriate assessment screening required for most rural sites due to extensive SAC and SPA coverage." },
    ],
    links: [
      { label: "Wicklow County Development Plan", url: "https://www.wicklow.ie/planning/" },
    ],
  },
};

// Fill remaining counties with a generic entry so all 26 are selectable
const ALL_COUNTIES = [
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry","Kildare",
  "Kilkenny","Laois","Leitrim","Limerick","Longford","Louth","Mayo","Meath",
  "Monaghan","Offaly","Roscommon","Sligo","Tipperary","Waterford","Westmeath",
  "Wexford","Wicklow",
];

const GENERIC_ENTRY = (name: string): CountyData => ({
  countyName: name,
  policies: [
    { title: "County Development Plan", detail: `${name} County Council's Development Plan sets out the planning policies and objectives for the county. Consult the current CDP for rural housing policies, settlement strategy, and area-specific objectives before submitting any application.` },
    { title: "Local Area Plans",        detail: "Many towns and villages in the county have Local Area Plans (LAPs) or Mini-Plans that apply more detailed policies. Check whether the development site falls within an LAP area." },
    { title: "Pre-Application Consultation", detail: "Pre-application consultation is available for larger or complex developments. This is strongly recommended before lodging applications for protected structures, significant developments, or applications in sensitive areas." },
  ],
  warnings: [
    { text: "Always confirm the correct planning authority boundary before submitting. Some county boundaries have changed following boundary commission reviews." },
    { text: "Check An Bord Pleanála's website for any extant Section 5 declarations or SID/LARD procedures that may apply in the area." },
  ],
  links: [
    { label: `${name} County Council`, url: `https://www.${name.toLowerCase().replace(/\s/g,"")}.ie/` },
  ],
});

ALL_COUNTIES.forEach(c => {
  if (!COUNTIES[c]) COUNTIES[c] = GENERIC_ENTRY(c);
});

// ── Component ─────────────────────────────────────────────────────────────────

export default function CountyIntelligencePage() {
  const [selected, setSelected] = useState<string>("");
  const data = selected ? COUNTIES[selected] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">County Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">
          Planning policies, local area requirements, and known sensitivities for all 26 Irish counties.
        </p>
      </div>

      {/* County selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select County</label>
        <select
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">Choose a county…</option>
          {ALL_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {data && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{data.countyName}</h2>

          {/* Policies */}
          {data.policies.length > 0 && (
            <div className="space-y-3">
              {data.policies.map((p, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-blue-700 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{p.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {data.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Things to Watch
              </h3>
              <ul className="space-y-2">
                {data.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {w.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          {data.links.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Useful Links</h3>
              <div className="space-y-2">
                {data.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
