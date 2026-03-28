"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/AppShell";
import { CountyIntelPanel } from "@/app/components/CountyIntelPanel";

const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin",
  "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim",
  "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan",
  "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford",
  "Westmeath", "Wexford", "Wicklow",
];

const GAELTACHT_COUNTIES = new Set([
  "Galway", "Mayo", "Donegal", "Kerry", "Cork", "Waterford", "Meath",
]);

const APP_TYPES = [
  "New Build Rural",
  "New Build Urban",
  "Rear Extension",
  "Side Extension",
  "Attic Conversion",
  "Change of Use",
  "Retention",
  "Protected Structure",
] as const;

type AppType = (typeof APP_TYPES)[number];

interface DocItem {
  id: string;
  label: string;
  detail: string;
  ruralOnly?: boolean;
  heritageOnly?: boolean;
}

const CHECKLISTS: Record<AppType, DocItem[]> = {
  "New Build Rural": [
    {
      id: "form",
      label: "Planning application form",
      detail: "Completed standard planning application form, available from your local authority or the planning authority's website.",
    },
    {
      id: "fee",
      label: "Planning application fee",
      detail: "Fee payable to the local authority. Check the current fee schedule on your county council's website — fees vary by application type and floor area.",
    },
    {
      id: "location-map",
      label: "Site location map",
      detail: "Ordnance Survey map at a scale of not less than 1:10,560 (6-inch OS map) with the application site clearly outlined in red and all other land in the applicant's ownership outlined in blue.",
    },
    {
      id: "layout",
      label: "Site layout plan",
      detail: "Block plan at 1:500 scale showing the site boundary, proposed dwelling, vehicular access, parking, drainage layout, and distances to all site boundaries.",
    },
    {
      id: "floor-plans",
      label: "Floor plans",
      detail: "Floor plans at 1:100 or 1:200 scale showing all rooms, their dimensions, and intended use.",
    },
    {
      id: "elevations",
      label: "Elevations (all four sides)",
      detail: "All four elevations at 1:100 or 1:200 scale, clearly indicating proposed external materials, finishes, and window/door positions.",
    },
    {
      id: "local-needs",
      label: "Local needs statement",
      detail: "Written statement demonstrating a genuine local housing need in accordance with the Rural Housing policy of the County Development Plan. Typically includes evidence of family connections, employment, or long-term residence in the area.",
      ruralOnly: true,
    },
    {
      id: "perc-test",
      label: "Percolation test results",
      detail: "Results of a site suitability assessment and percolation test carried out by a qualified engineer. Required where connection to a public sewer is not available.",
      ruralOnly: true,
    },
    {
      id: "site-suitability",
      label: "Site suitability assessment report",
      detail: "Engineer's report confirming the site can accommodate an on-site wastewater treatment system in compliance with the EPA Code of Practice for Wastewater Treatment and Disposal Systems Serving Single Houses.",
      ruralOnly: true,
    },
    {
      id: "septic-design",
      label: "Septic tank / treatment system design",
      detail: "Detailed design drawings and specifications for the proposed on-site wastewater treatment system and percolation area, prepared by a competent person.",
      ruralOnly: true,
    },
    {
      id: "sight-lines",
      label: "Sight line drawings",
      detail: "Drawing showing road visibility splays at the proposed site entrance, confirming compliance with the Design Manual for Urban Roads and Streets (DMURS) or relevant County Development Plan standards.",
      ruralOnly: true,
    },
    {
      id: "newspaper",
      label: "Newspaper notice",
      detail: "Public notice published in an approved newspaper circulating in the area of the proposed development, placed at least 2 weeks before the application is lodged. Must include prescribed particulars as set out in the Planning & Development Regulations.",
    },
    {
      id: "site-notice-photo",
      label: "Site notice photograph",
      detail: "Photograph showing the site notice erected on the land, demonstrating that it is legible and has been properly displayed in a prominent position facing the public road.",
    },
  ],

  "New Build Urban": [
    {
      id: "form",
      label: "Planning application form",
      detail: "Completed standard planning application form, available from your local authority or the planning authority's website.",
    },
    {
      id: "fee",
      label: "Planning application fee",
      detail: "Fee payable to the local authority. Check the current fee schedule on your county council's website — fees vary by application type and floor area.",
    },
    {
      id: "location-map",
      label: "Site location map",
      detail: "Ordnance Survey map at a scale of not less than 1:10,560 with the application site clearly outlined in red and all other land in the applicant's ownership outlined in blue.",
    },
    {
      id: "layout",
      label: "Site layout plan",
      detail: "Block plan at 1:500 scale showing the site boundary, proposed dwelling, vehicular access, parking, landscaping, and the relationship to adjoining properties and the public road.",
    },
    {
      id: "floor-plans",
      label: "Floor plans",
      detail: "Floor plans at 1:100 or 1:200 scale showing all rooms, their dimensions and intended use, and the relationship of the building to site boundaries.",
    },
    {
      id: "elevations",
      label: "Elevations (all four sides)",
      detail: "All four elevations at 1:100 or 1:200 scale, showing proposed external materials, finishes, and how the building relates in height and scale to adjoining buildings.",
    },
    {
      id: "sections",
      label: "Cross-sections",
      detail: "At least one cross-section through the building at 1:100 scale, showing finished floor levels, floor-to-ceiling heights, and ground levels.",
    },
    {
      id: "newspaper",
      label: "Newspaper notice",
      detail: "Public notice published in an approved newspaper circulating in the area, placed at least 2 weeks before the application is lodged.",
    },
    {
      id: "site-notice-photo",
      label: "Site notice photograph",
      detail: "Photograph showing the site notice erected on the land in a prominent position facing the public road.",
    },
  ],

  "Rear Extension": [
    {
      id: "form",
      label: "Planning application form",
      detail: "Completed standard planning application form, available from your local authority.",
    },
    {
      id: "fee",
      label: "Planning application fee",
      detail: "Fee payable to the local authority. Check the current fee schedule — house extension fees are typically based on floor area.",
    },
    {
      id: "location-map",
      label: "Site location map",
      detail: "Ordnance Survey map at 1:10,560 scale with the application site outlined in red.",
    },
    {
      id: "layout",
      label: "Site layout / block plan",
      detail: "Block plan at 1:500 scale showing the site boundary, the existing dwelling, and the proposed extension. Include distances from the extension to all boundaries.",
    },
    {
      id: "floor-plans",
      label: "Floor plans (existing and proposed)",
      detail: "Floor plans at 1:100 scale clearly showing both the existing layout and the proposed changes. Areas to be demolished should be shown in a contrasting colour.",
    },
    {
      id: "elevations",
      label: "Elevations (all affected sides)",
      detail: "Elevations of all affected sides of the house at 1:100 scale, showing existing and proposed. Indicate proposed materials and finishes.",
    },
  ],

  "Side Extension": [
    {
      id: "form",
      label: "Planning application form",
      detail: "Completed standard planning application form, available from your local authority.",
    },
    {
      id: "fee",
      label: "Planning application fee",
      detail: "Fee payable to the local authority. Check the current fee schedule — house extension fees are typically based on floor area.",
    },
    {
      id: "location-map",
      label: "Site location map",
      detail: "Ordnance Survey map at 1:10,560 scale with the application site outlined in red.",
    },
    {
      id: "layout",
      label: "Site layout / block plan",
      detail: "Block plan at 1:500 scale showing the site boundary, the existing dwelling, and the proposed side extension. Include distances from the extension to the side boundary.",
    },
    {
      id: "floor-plans",
      label: "Floor plans (existing and proposed)",
      detail: "Floor plans at 1:100 scale clearly showing both the existing layout and the proposed changes.",
    },
    {
      id: "elevations",
      label: "Elevations (all affected sides)",
      detail: "Elevations of all affected sides at 1:100 scale showing existing and proposed. Indicate proposed materials and how the extension relates in scale and design to the existing dwelling.",
    },
  ],

  "Attic Conversion": [
    {
      id: "form",
      label: "Planning application form",
      detail: "Completed standard planning application form, available from your local authority.",
    },
    {
      id: "fee",
      label: "Planning application fee",
      detail: "Fee payable to the local authority. Check the current fee schedule.",
    },
    {
      id: "location-map",
      label: "Site location map",
      detail: "Ordnance Survey map at 1:10,560 scale with the application site outlined in red.",
    },
    {
      id: "layout",
      label: "Site layout / block plan",
      detail: "Block plan at 1:500 scale showing the site and the existing dwelling.",
    },
    {
      id: "floor-plans",
      label: "Floor plans (existing and proposed)",
      detail: "Floor plans at 1:100 scale showing all floors including the existing attic space and the proposed converted layout with room dimensions.",
    },
    {
      id: "roof-plans",
      label: "Roof plans and cross-sections",
      detail: "Roof plan and at least one cross-section at 1:100 scale showing any dormer windows, roof lights, or structural alterations. The section should show head heights in the converted space.",
    },
    {
      id: "elevations",
      label: "Elevations (all affected sides)",
      detail: "Elevations at 1:100 scale showing any external changes including dormer windows or roof lights, with proposed materials indicated.",
    },
  ],

  "Change of Use": [
    {
      id: "form",
      label: "Planning application form",
      detail: "Completed standard planning application form, available from your local authority.",
    },
    {
      id: "fee",
      label: "Planning application fee",
      detail: "Fee payable to the local authority. Check the current fee schedule for change of use applications.",
    },
    {
      id: "location-map",
      label: "Site location map",
      detail: "Ordnance Survey map at 1:10,560 scale with the application site outlined in red.",
    },
    {
      id: "layout",
      label: "Site layout and floor plans",
      detail: "Floor plans at 1:100 or 1:200 scale showing the existing layout and the proposed layout under the new use. Include parking, access, and any internal alterations.",
    },
    {
      id: "use-statement",
      label: "Statement of intended use",
      detail: "Written statement describing the proposed use class, hours of operation, expected customer or visitor numbers, staffing levels, and any associated fit-out works.",
    },
    {
      id: "newspaper",
      label: "Newspaper notice",
      detail: "Public notice published in an approved newspaper circulating in the area, placed at least 2 weeks before the application is lodged.",
    },
    {
      id: "site-notice-photo",
      label: "Site notice photograph",
      detail: "Photograph showing the site notice erected at the property in a prominent position visible from the public road or footpath.",
    },
  ],

  "Retention": [
    {
      id: "form",
      label: "Planning application form",
      detail: "Completed standard planning application form for retention of unauthorised development, available from your local authority.",
    },
    {
      id: "fee",
      label: "Planning application fee (retention rate)",
      detail: "Retention applications attract a higher fee than standard applications. Check the current retention fee schedule with your local authority before submitting.",
    },
    {
      id: "location-map",
      label: "Site location map",
      detail: "Ordnance Survey map at 1:10,560 scale with the application site outlined in red.",
    },
    {
      id: "layout",
      label: "Site layout / block plan (as-built)",
      detail: "Block plan at 1:500 scale showing the site and what has actually been built, including distances to boundaries. This must reflect the structure as it currently exists.",
    },
    {
      id: "floor-plans",
      label: "Floor plans (as-built)",
      detail: "Floor plans at 1:100 or 1:200 scale accurately depicting the structure as it currently exists, not as originally intended.",
    },
    {
      id: "elevations",
      label: "Elevations (as-built)",
      detail: "Elevations at 1:100 scale of all sides accurately showing the structure as built, including external materials and finishes.",
    },
    {
      id: "newspaper",
      label: "Newspaper notice",
      detail: "Public notice published in an approved newspaper circulating in the area, placed at least 2 weeks before the application is lodged.",
    },
    {
      id: "site-notice-photo",
      label: "Site notice photograph",
      detail: "Photograph showing the site notice erected on the land in a prominent position visible from the public road.",
    },
  ],

  "Protected Structure": [
    {
      id: "form",
      label: "Planning application form",
      detail: "Completed standard planning application form, available from your local authority.",
    },
    {
      id: "fee",
      label: "Planning application fee",
      detail: "Fee payable to the local authority. Check the current fee schedule on your county council's website.",
    },
    {
      id: "location-map",
      label: "Site location map",
      detail: "Ordnance Survey map at 1:10,560 scale with the application site outlined in red.",
    },
    {
      id: "layout",
      label: "Site layout / block plan",
      detail: "Block plan at 1:500 scale showing the site and any proposed works in relation to the protected structure and its curtilage.",
    },
    {
      id: "floor-plans",
      label: "Floor plans (existing and proposed)",
      detail: "Floor plans at 1:100 scale clearly distinguishing existing historic fabric from proposed works. Areas to be removed should be shown in a contrasting colour.",
    },
    {
      id: "elevations",
      label: "Elevations and cross-sections",
      detail: "All affected elevations and cross-sections at 1:100 scale, indicating existing and proposed materials, finishes, and the treatment of original features.",
    },
    {
      id: "heritage-impact",
      label: "Architectural heritage impact assessment",
      detail: "Report by a suitably qualified heritage professional (typically a conservation architect or architectural historian) assessing the impact of the proposed works on the special character, integrity, and significance of the protected structure.",
      heritageOnly: true,
    },
    {
      id: "conservation-report",
      label: "Conservation architect's report",
      detail: "Detailed condition survey and specification prepared by a conservation-accredited architect (RIAI Conservation Accreditation or equivalent), describing proposed repair methods, materials, and how original fabric will be retained and protected.",
      heritageOnly: true,
    },
    {
      id: "newspaper",
      label: "Newspaper notice",
      detail: "Public notice published in an approved newspaper circulating in the area, placed at least 2 weeks before the application is lodged.",
    },
    {
      id: "site-notice-photo",
      label: "Site notice photograph",
      detail: "Photograph showing the site notice erected at the property in a prominent position visible from the public road.",
    },
  ],
};

const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const selectClass =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none cursor-pointer";

export default function ChecklistPage() {
  const [appType, setAppType] = useState<AppType | "">("");
  const [county, setCounty] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function handleAppTypeChange(val: AppType | "") {
    setAppType(val);
    setChecked(new Set());
  }

  const items: DocItem[] = appType ? CHECKLISTS[appType] : [];
  const checkedCount = items.filter((i) => checked.has(i.id)).length;
  const showChecklist = appType !== "" && county !== "";
  const isGaeltacht = GAELTACHT_COUNTIES.has(county);

  function toggleItem(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePrint() {
    window.print();
  }

  const progressPct = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <AppShell>
      {/* Print-only header — invisible on screen */}
      <div className="hidden print:block px-8 pt-8 pb-4 border-b border-gray-200 mb-6">
        <p className="text-2xl font-bold text-gray-900">PlanAssist — Document Checklist</p>
        {showChecklist && (
          <p className="mt-1 text-base text-gray-600">
            {appType} &mdash; Co. {county}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Printed from planassist.ie &middot; Guidance only — not a substitute for professional planning advice.
        </p>
      </div>

      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-3xl mx-auto">

        {/* Page header */}
        <div className="mb-7 sm:mb-10 print:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Document Checklist
          </h1>
          <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
            Select your application type and county to see every document required for your planning
            application, then tick each item off as you gather it.
          </p>
        </div>

        {/* Selector card — hidden on print */}
        <div className="print:hidden bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className={labelClass} htmlFor="appType">
                Application type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="appType"
                  value={appType}
                  onChange={(e) => handleAppTypeChange(e.target.value as AppType | "")}
                  className={selectClass}
                >
                  <option value="" disabled>Select application type…</option>
                  {APP_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="county">
                County <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="county"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className={selectClass}
                >
                  <option value="" disabled>Select a county…</option>
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* County intelligence panel */}
        {county && (
          <CountyIntelPanel county={county} className="mt-5 print:hidden" />
        )}

        {/* Empty state */}
        {!showChecklist && (
          <div className="print:hidden mt-8 flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Select an application type and county above to generate your checklist.
            </p>
          </div>
        )}

        {/* Checklist */}
        {showChecklist && (
          <div className="mt-6">

            {/* Checklist header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4 print:mb-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900 print:hidden">
                  {appType} &mdash; Co. {county}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 print:hidden">
                  {/* Progress bar */}
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{checkedCount}</span> of{" "}
                    <span className="font-semibold text-gray-900">{items.length}</span> documents gathered
                  </p>
                </div>
              </div>

              {/* Print button */}
              <button
                onClick={handlePrint}
                className="print:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
                Print checklist
              </button>
            </div>

            {/* Gaeltacht note */}
            {isGaeltacht && (
              <div className="mb-4 flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                <p className="text-xs text-blue-800 leading-relaxed">
                  <span className="font-semibold">Gaeltacht area notice:</span> Co. {county} includes
                  Gaeltacht areas. If your site is within a Gaeltacht area, your newspaper notice must
                  also be published in an approved Irish-language newspaper. Check with your local
                  authority to confirm requirements.
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="print:hidden mb-4 flex flex-wrap gap-3">
              {items.some((i) => i.ruralOnly) && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  Rural-specific requirement
                </span>
              )}
              {items.some((i) => i.heritageOnly) && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                  Protected structure requirement
                </span>
              )}
            </div>

            {/* Document items */}
            <div className="space-y-2.5">
              {items.map((item, index) => {
                const isChecked = checked.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex gap-4 p-4 sm:p-5 rounded-2xl border transition-colors cursor-pointer print:cursor-default print:border-gray-200 print:bg-white ${
                      isChecked
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors print:border-gray-400 ${
                          isChecked
                            ? "bg-green-600 border-green-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Item number */}
                        <span className="text-xs font-mono text-gray-400 print:hidden">{String(index + 1).padStart(2, "0")}</span>
                        <span className={`text-sm font-semibold ${isChecked ? "text-green-800 line-through decoration-green-400" : "text-gray-900"} print:text-gray-900 print:no-underline`}>
                          {item.label}
                        </span>
                        {item.ruralOnly && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Rural
                          </span>
                        )}
                        {item.heritageOnly && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Heritage
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed ${isChecked ? "text-green-700" : "text-gray-500"} print:text-gray-600`}>
                        {item.detail}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* All done */}
            {checkedCount === items.length && items.length > 0 && (
              <div className="print:hidden mt-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-800">
                  All {items.length} documents gathered — your application pack looks complete.
                </p>
              </div>
            )}

          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 sm:mt-10 flex gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 print:mt-6 print:bg-white">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Guidance only — not legal advice.</span>{" "}
            Document requirements vary by local authority and specific site circumstances. Always
            confirm the exact requirements with your local planning authority or a qualified planning
            consultant before submitting your application. Some authorities may request additional
            documents not listed here.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
