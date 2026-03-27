"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PolicyItem {
  title: string;
  detail: string;
}

interface WarningItem {
  text: string;
}

interface LinkItem {
  label: string;
  url: string;
}

interface DocLinkItem {
  label: string;
  url: string;
  description?: string;
}

interface CountyIntelData {
  countyName: string;
  policies: PolicyItem[];
  warnings: WarningItem[];
  links: LinkItem[];
  sampleDocs: DocLinkItem[];
}

// ─── County data ───────────────────────────────────────────────────────────────

const COUNTY_INTEL: Record<string, CountyIntelData> = {
  Kildare: {
    countyName: "Kildare",
    policies: [
      {
        title: "30-Dwelling Townland Density Cap",
        detail:
          "Kildare County Development Plan limits rural housing to 30 dwellings per townland. This applies to all rural one-off planning applications and is strictly enforced. The cap includes existing dwellings — a townland already at or near 30 units will not receive consent regardless of the local needs justification.",
      },
      {
        title: "Gap Policy for Rural Sites",
        detail:
          "Kildare operates a gap policy: new rural dwellings must fill a genuine gap in the landscape and must not extend an existing ribbon of development. Sites must demonstrate that the proposed dwelling would close a visual gap between existing structures, not add to a ribbon. Setbacks, sight-lines, and boundary treatment are all assessed.",
      },
      {
        title: "Local Needs — Rural Planning",
        detail:
          "Applicants must demonstrate genuine local housing need as defined in the Kildare CDP Rural Housing Policy. The policy distinguishes between established native rural families (strongest category), landowners with no alternative site, and other rural needs. Applications from non-county residents are scrutinised closely.",
      },
    ],
    warnings: [
      {
        text: "Density must be calculated before any design work begins. Submitting an application to a townland already at the 30-dwelling cap is an automatic refusal. Confirm the existing dwelling count in the townland with the planning department or a local planning consultant before commissioning drawings.",
      },
      {
        text: "The gap policy is applied strictly — do not assume a vacant site automatically qualifies. Ribbon development refusals are common on rural county roads.",
      },
      {
        text: "Kildare is in a high-growth commuter belt. Any application for a new rural dwelling will face elevated scrutiny due to historical over-development pressure in the county.",
      },
    ],
    links: [
      {
        label: "Kildare County Development Plan 2023–2029",
        url: "https://kildare.ie/planning/CountyDevelopmentPlan/",
      },
      {
        label: "Rural Housing Policy — Kildare CDP Volume 1",
        url: "https://kildare.ie/planning/CountyDevelopmentPlan/",
      },
      {
        label: "Kildare Planning Department",
        url: "https://kildare.ie/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form (A1 — General)",
        url: "https://kildare.ie/planning/PlanningApplication/",
        description: "Standard application form for all planning applications to Kildare County Council",
      },
      {
        label: "Rural Character & Landscape Assessment Form",
        url: "https://kildare.ie/planning/PlanningApplication/",
        description: "Supporting form required for all rural one-off dwelling applications",
      },
      {
        label: "Pre-Application Consultation Request",
        url: "https://kildare.ie/planning/PlanningApplication/PreApplicationConsultation/",
        description: "Request a pre-application meeting with a Kildare planning officer",
      },
    ],
  },

  Dublin: {
    countyName: "Dublin",
    policies: [
      {
        title: "Urban Residential Density Requirements",
        detail:
          "Dublin City Council requires minimum residential densities of 35 units per hectare in outer suburban areas, 50+ units per hectare in urban centres, and 100+ units per hectare in the city centre and SDZ areas. Extensions and alterations must not result in under-utilisation of urban land. All proposals are assessed against the Sustainable Urban Housing Design Standards (SUHDS) guidelines.",
      },
      {
        title: "Part V Social & Affordable Housing Obligations",
        detail:
          "Any residential development of 10 or more units (or 0.1 hectares or more) must comply with Part V of the Planning and Development Act 2000 (as amended). This requires 10% of units to be transferred to the local authority or approved housing body at cost, or a monetary contribution in lieu. Part V must be agreed with the housing section before submission.",
      },
      {
        title: "Design Standards & Active Frontage",
        detail:
          "Dublin City Council requires active ground-floor frontages on primary streets. Blank walls, roller shutters, and inactive uses on key street frontages are refused. Residential developments must achieve minimum floor-to-ceiling heights of 2.7m (ground floor) and 2.4m (upper floors).",
      },
    ],
    warnings: [
      {
        text: "Part V compliance is a pre-condition — not an afterthought. Failure to agree a Part V scheme with the Housing Section before submission is the single most common cause of refusals and long delays on Dublin residential applications.",
      },
      {
        text: "Dublin City has active BID zones and conservation areas where demolition or significant external alteration may require additional heritage assessment. Check the Record of Protected Structures before submitting.",
      },
      {
        text: "Development in the North Docklands, Poolbeg, and Clongriffin SDZ areas is governed by separate SDZ Planning Schemes — these take precedence over the City Development Plan. Always verify whether a site falls within an SDZ boundary.",
      },
    ],
    links: [
      {
        label: "Dublin City Development Plan 2022–2028",
        url: "https://www.dublincity.ie/planning/planning-and-development-plan/dublin-city-development-plan-2022-2028",
      },
      {
        label: "Dublin City Council Planning Department",
        url: "https://www.dublincity.ie/planning",
      },
      {
        label: "Dublin City — Pre-Application Consultation",
        url: "https://www.dublincity.ie/planning/planning-applications/pre-application-consultations",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form (Dublin City Council)",
        url: "https://www.dublincity.ie/planning/planning-applications/how-apply-planning-permission",
        description: "Standard application form and submission guide",
      },
      {
        label: "Part V Agreement — Social Housing Section",
        url: "https://www.dublincity.ie/housing/social-housing-schemes/part-v",
        description: "Part V compliance process and submission requirements",
      },
      {
        label: "Site Notice Template",
        url: "https://www.dublincity.ie/planning/planning-applications/how-apply-planning-permission",
        description: "Statutory site notice requirements and format",
      },
    ],
  },

  Donegal: {
    countyName: "Donegal",
    policies: [
      {
        title: "Second Home & Holiday Home Restrictions",
        detail:
          "Donegal County Development Plan contains explicit restrictions on second homes and holiday homes in rural areas and sensitive coastal zones. Planning permission for a new dwelling may include a condition prohibiting use as a holiday home or requiring occupation by the applicant for a minimum period (typically 7 years). These conditions are tied to the land and transfer to future purchasers.",
      },
      {
        title: "Areas of Outstanding Natural Beauty (AONB)",
        detail:
          "Donegal has designated Areas of Outstanding Natural Beauty covering significant portions of its coastline and upland areas — including Inishowen Peninsula, the Bluestack Mountains, and the Slieve League coastal zone. Within these areas, the presumption is strongly against new one-off rural dwellings unless the applicant can demonstrate exceptional local needs and superior design. External materials, roof pitch, and siting are all subject to heightened scrutiny.",
      },
      {
        title: "Rural Settlement Policy — Tier Classification",
        detail:
          "Donegal's Rural Settlement Policy classifies rural land into tiers (Strong Rural Areas, Structurally Weak Areas, Gaeltacht Areas, and Protected/Sensitive Landscapes). Each tier has different thresholds for local needs and design requirements. Structurally weak areas — primarily inland and depopulating regions — have a more permissive approach to facilitate rural repopulation.",
      },
    ],
    warnings: [
      {
        text: "AONB boundaries are not always obvious on standard OS maps — always check the full zoning map in the County Development Plan before site selection. A site 200 metres outside an AONB may be treated very differently from one inside it.",
      },
      {
        text: "Second home conditions are increasingly enforced in Donegal. Applicants who represent themselves as permanent residents but subsequently use the property as a holiday home may face enforcement action. Ensure the client's stated intention in the local needs statement accurately reflects long-term plans.",
      },
      {
        text: "Gaeltacht areas in Donegal (primarily Gweedore, the Rosses, and Glencolumbkille) require adherence to specific Irish language signage requirements and may require the Irish language version of the newspaper notice.",
      },
    ],
    links: [
      {
        label: "Donegal County Development Plan",
        url: "https://www.donegalcoco.ie/services/planning/countydevelopmentplan/",
      },
      {
        label: "Donegal Planning Department",
        url: "https://www.donegalcoco.ie/services/planning/",
      },
      {
        label: "Rural Housing Guidelines — Donegal",
        url: "https://www.donegalcoco.ie/services/planning/ruraldevelopment/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form (Donegal County Council)",
        url: "https://www.donegalcoco.ie/services/planning/planningapplications/",
        description: "Standard planning application form and submission guidance",
      },
      {
        label: "Rural Housing Design Guide",
        url: "https://www.donegalcoco.ie/services/planning/ruraldevelopment/",
        description: "Design principles for rural dwellings in Donegal",
      },
      {
        label: "Local Needs Statement — Guidance Note",
        url: "https://www.donegalcoco.ie/services/planning/planningapplications/",
        description: "How to prepare a local needs statement for Donegal applications",
      },
    ],
  },
};

// ─── Normalisation helpers ──────────────────────────────────────────────────────

// Map full council names to county keys
const COUNCIL_NAME_MAP: Record<string, string> = {
  "Kildare County Council": "Kildare",
  "Dublin City Council": "Dublin",
  "Dún Laoghaire-Rathdown County Council": "Dublin",
  "Fingal County Council": "Dublin",
  "South Dublin County Council": "Dublin",
  "Donegal County Council": "Donegal",
};

function resolveCounty(input: string): string {
  if (!input) return "";
  const direct = COUNTY_INTEL[input];
  if (direct) return input;
  const mapped = COUNCIL_NAME_MAP[input];
  if (mapped) return mapped;
  // Strip common council suffixes and try again
  const stripped = input
    .replace(/ (City &amp; County|City and County|City & County|County|City) Council$/i, "")
    .trim();
  if (COUNTY_INTEL[stripped]) return stripped;
  return "";
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface CountyIntelPanelProps {
  /** Accepts either a plain county name ("Kildare") or a full council name ("Kildare County Council") */
  county: string;
  className?: string;
}

export function CountyIntelPanel({ county, className = "" }: CountyIntelPanelProps) {
  const [open, setOpen] = useState(true);

  if (!county) return null;

  const key = resolveCounty(county);
  const data = key ? COUNTY_INTEL[key] : null;

  return (
    <div className={`rounded-2xl border border-indigo-200 bg-indigo-50 overflow-hidden ${className}`}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 sm:px-5 hover:bg-indigo-100/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Map pin icon */}
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-indigo-900 leading-snug">
              {data ? `Co. ${data.countyName} — Planning Intelligence` : "County Planning Intelligence"}
            </p>
            {!open && data && (
              <p className="text-xs text-indigo-500 mt-0.5">
                {data.warnings.length} warning{data.warnings.length !== 1 ? "s" : ""} &middot; {data.policies.length} key {data.policies.length !== 1 ? "policies" : "policy"}
              </p>
            )}
          </div>
        </div>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 flex-shrink-0 text-indigo-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4 border-t border-indigo-200/70">

          {data ? (
            <>
              {/* ── Critical warnings ── */}
              {data.warnings.length > 0 && (
                <div className="mt-4">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-600 mb-2.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    Critical warnings
                  </h3>
                  <div className="space-y-2">
                    {data.warnings.map((w, i) => (
                      <div key={i} className="flex gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                        <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                        <p className="text-sm text-red-800 leading-relaxed">{w.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Key policies ── */}
              {data.policies.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 mb-2.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Key county policies
                  </h3>
                  <div className="space-y-2.5">
                    {data.policies.map((p, i) => (
                      <div key={i} className="bg-white border border-indigo-200 rounded-xl px-4 py-3.5">
                        <p className="text-sm font-semibold text-indigo-900 mb-1">{p.title}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{p.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Links & sample docs in a two-column grid on wider screens ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Development plan links */}
                {data.links.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 mb-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Development plans
                    </h3>
                    <div className="space-y-1.5">
                      {data.links.map((l, i) => (
                        <a
                          key={i}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900 hover:underline underline-offset-2 bg-white border border-indigo-200 rounded-lg px-3 py-2.5 transition-colors group"
                        >
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="leading-snug">{l.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample documents */}
                {data.sampleDocs.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 mb-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Sample documents
                    </h3>
                    <div className="space-y-1.5">
                      {data.sampleDocs.map((d, i) => (
                        <a
                          key={i}
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={d.description}
                          className="flex items-start gap-2 text-sm text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 rounded-lg px-3 py-2.5 transition-colors group hover:border-indigo-300"
                        >
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400 group-hover:text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="leading-snug">{d.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Unknown county — coming soon notice ── */
            <div className="mt-4 flex items-start gap-3 bg-white border border-indigo-200 rounded-xl px-4 py-4">
              <svg className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-indigo-900">More counties being added</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                  County-specific planning intelligence for {county} is coming soon. Currently available for Kildare, Dublin, and Donegal.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
