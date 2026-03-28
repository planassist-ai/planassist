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
  Carlow: {
    countyName: "Carlow",
    policies: [
      {
        title: "Rural Housing — Local Needs Requirement",
        detail:
          "Carlow County Development Plan requires applicants for rural one-off dwellings to demonstrate genuine local housing need. The plan distinguishes between those with a family connection to the land, those employed locally in agriculture or rural enterprise, and other rural needs. Commuter-driven rural applications face close scrutiny given the county's proximity to Dublin and the M9 corridor.",
      },
      {
        title: "Commuter Belt Pressure Areas",
        detail:
          "The eastern parts of Carlow, particularly the Carlow town environs and the Muinebheag/Bagenalstown area, are identified as areas under commuter pressure from Dublin and Kilkenny. In these zones, the rural housing policy is applied more strictly to prevent further ribbon and one-off development along rural roads.",
      },
      {
        title: "Landscape & Heritage Designations",
        detail:
          "Carlow contains significant archaeological and geological heritage, including the Carlow Carboniferous Limestone plateau. Areas near Brownshill Dolmen and the Barrow Valley are subject to heightened heritage assessment requirements. Visual impact assessments are required for sites within or adjacent to designated scenic routes.",
      },
    ],
    warnings: [
      {
        text: "Carlow sits within Dublin's commuter catchment. Applications for new rural dwellings from non-county residents or from applicants with an urban address will face elevated scrutiny. A strong local needs justification is essential.",
      },
      {
        text: "The Barrow Valley corridor is a sensitive landscape with both ecological and heritage designations. Any development adjacent to the River Barrow must include an ecological assessment.",
      },
    ],
    links: [
      {
        label: "Carlow County Development Plan",
        url: "https://www.carlowcoco.ie/services/planning/county-development-plan/",
      },
      {
        label: "Carlow Planning Department",
        url: "https://www.carlowcoco.ie/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Carlow County Council",
        url: "https://www.carlowcoco.ie/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
      {
        label: "Pre-Application Consultation Request",
        url: "https://www.carlowcoco.ie/services/planning/planning-applications/",
        description: "Request a pre-application meeting with a Carlow planning officer",
      },
    ],
  },

  Cavan: {
    countyName: "Cavan",
    policies: [
      {
        title: "Rural Housing — Local Needs & Border County Policy",
        detail:
          "Cavan County Development Plan contains a rural housing policy that requires demonstration of genuine local need. As a border county, Cavan's policy acknowledges cross-border family connections. Applicants from Northern Ireland with a demonstrable family or employment connection to the county may be considered under the local needs criteria in certain circumstances.",
      },
      {
        title: "Lakeland & Drumlin Landscape Designations",
        detail:
          "Cavan is characterised by its drumlin topography and lake-studded landscape. Areas around Lough Sheelin, Lough Oughter, and the Upper Erne waterway system are subject to strict siting and design requirements. Dwellings must be sited to minimise visual impact on the drumlin landscape and must not be located on exposed hilltop or ridge positions.",
      },
      {
        title: "Forestry & Agricultural Diversification",
        detail:
          "Given Cavan's significant agricultural and forestry economy, the development plan contains specific policies supporting farm diversification, including on-farm tourism and rural enterprise. These may provide an additional avenue for planning consent in rural areas where a standard local needs case is weak.",
      },
    ],
    warnings: [
      {
        text: "Sites on or near drumlin ridgelines are routinely refused in Cavan due to visual impact on the characteristic landscape. Low-lying or mid-slope sites with existing natural screen planting are strongly preferred.",
      },
      {
        text: "Riparian buffer zones apply along all watercourses under the EU Water Framework Directive. Development within 30m of any watercourse or lake shoreline will require an ecological assessment and may face objection from Inland Fisheries Ireland.",
      },
    ],
    links: [
      {
        label: "Cavan County Development Plan",
        url: "https://www.cavancoco.ie/services/planning/county-development-plan/",
      },
      {
        label: "Cavan Planning Department",
        url: "https://www.cavancoco.ie/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Cavan County Council",
        url: "https://www.cavancoco.ie/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Clare: {
    countyName: "Clare",
    policies: [
      {
        title: "Burren Special Amenity Area — Extremely Strict Controls",
        detail:
          "The Burren is designated as a Special Amenity Area Order (SAAO) under the Planning and Development Act. Within the Burren, the bar for new residential development is exceptionally high. Development must demonstrate that it will not adversely affect the karst limestone landscape, the rare flora, or archaeological monuments. Almost all new rural one-off dwellings within the SAAO core area face strong presumption against.",
      },
      {
        title: "Coastal Zone Management Policy",
        detail:
          "Clare's extensive Atlantic coastline — including the Cliffs of Moher, Loop Head Peninsula, and the Burren coast — is subject to Coastal Zone Management policies. New development within 300m of the high water mark requires a detailed Coastal Impact Assessment. The scenic coast road areas around Kilkee and Doolin are particularly sensitive.",
      },
      {
        title: "Rural Settlement Policy — Structurally Weak Areas",
        detail:
          "Clare classifies its rural hinterland into settlement tiers. Remote inland areas such as East Clare and parts of North Clare that have experienced depopulation are classified as Structurally Weak Areas, where a more permissive approach to rural housing is applied to encourage re-population. The West Clare coast and Burren are treated very differently.",
      },
    ],
    warnings: [
      {
        text: "The Burren SAAO boundaries must be checked before any site is selected. An application within the SAAO without exceptional justification is very likely to be refused. Always confirm the boundary with the Clare planning department.",
      },
      {
        text: "The Cliffs of Moher UNESCO Global Geopark and surrounding area has a tourism management plan that restricts additional visitor-related development. Commercial tourism proposals near the Cliffs require pre-application engagement.",
      },
      {
        text: "Shannon Estuary has a specific Shannon Integrated Framework Plan. Developments near the estuary may require assessment under this framework and may involve multiple statutory consultees including the Marine Survey Office.",
      },
    ],
    links: [
      {
        label: "Clare County Development Plan",
        url: "https://www.clarecoco.ie/services/planning/development-plans/county-development-plan/",
      },
      {
        label: "Clare Planning Department",
        url: "https://www.clarecoco.ie/services/planning/",
      },
      {
        label: "Burren & Cliffs of Moher Geopark",
        url: "https://www.burrengeopark.ie/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Clare County Council",
        url: "https://www.clarecoco.ie/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
      {
        label: "Burren SAAO Boundary Maps",
        url: "https://www.clarecoco.ie/services/planning/development-plans/county-development-plan/",
        description: "Check if a site falls within the Special Amenity Area Order",
      },
    ],
  },

  Cork: {
    countyName: "Cork",
    policies: [
      {
        title: "Split Jurisdiction — Cork City vs Cork County Council",
        detail:
          "Planning jurisdiction in Cork is divided between Cork City Council (urban Cork city area) and Cork County Council (the rest of the county). The 2019 boundary extension significantly enlarged Cork City Council's area. Always confirm which authority has jurisdiction for a site — a site that was previously in the county may now fall within the city boundary and be subject to different policies, density standards, and development plan objectives.",
      },
      {
        title: "Rural Housing — Significant Variation Across Sub-Areas",
        detail:
          "Cork County's rural housing policy varies considerably across its large area. The Metropolitan Cork Greenbelt (surrounding Cork City) has a very strict rural housing policy to resist commuter pressure. West Cork, particularly the Mizen Peninsula, Beara Peninsula, and Sheep's Head, applies a more nuanced policy. The Gaeltacht area around Muskerry (Múscraí) in mid-Cork has additional requirements. Each local area plan may modify the county baseline policy.",
      },
      {
        title: "Areas of Special Control & Coastal Management",
        detail:
          "Cork County has Areas of Special Control along its extensive coastline, particularly around Baltimore, Schull, Glengarriff, and the Beara Peninsula. Coastal development within 300m of the shoreline requires detailed justification. Natura 2000 sites are extensive in West Cork, including several SACs around the Mizen and Beara Peninsulas.",
      },
    ],
    warnings: [
      {
        text: "Always confirm whether the site is in Cork City Council or Cork County Council jurisdiction before commencing design. The 2019 boundary changes are not always reflected in older mapping. Use the official Cork Mapping Portal to confirm.",
      },
      {
        text: "The Metropolitan Greenbelt is strictly enforced. Any application for a new one-off dwelling within the greenbelt that cannot demonstrate genuine agricultural or local need will face a strong presumption against. Do not assume commuter convenience is an acceptable justification.",
      },
      {
        text: "West Cork has extensive SAC and SPA designations, particularly around estuaries, bays, and upland areas. Applications within or adjacent to Natura 2000 sites require Appropriate Assessment screening and possibly a full Natura Impact Statement.",
      },
    ],
    links: [
      {
        label: "Cork County Development Plan",
        url: "https://www.corkcoco.ie/en/resident/planning/cork-county-development-plan",
      },
      {
        label: "Cork City Development Plan",
        url: "https://www.corkcity.ie/en/council-services/planning/development-plan/",
      },
      {
        label: "Cork County Planning Department",
        url: "https://www.corkcoco.ie/en/resident/planning",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application — Cork County Council",
        url: "https://www.corkcoco.ie/en/resident/planning/planning-applications",
        description: "Standard planning application form for Cork County Council area",
      },
      {
        label: "Planning Application — Cork City Council",
        url: "https://www.corkcity.ie/en/council-services/planning/planning-applications/",
        description: "Standard planning application form for Cork City Council area",
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

  Galway: {
    countyName: "Galway",
    policies: [
      {
        title: "Split Jurisdiction — Galway City vs Galway County Council",
        detail:
          "As with Cork, planning in Galway is divided between Galway City Council and Galway County Council. Galway City has its own development plan with urban density requirements. The county plan applies to all rural areas and smaller towns. Always confirm jurisdiction before proceeding.",
      },
      {
        title: "Strong Rural Settlement Policy",
        detail:
          "Galway County has one of the most detailed rural settlement policies in the country, reflecting the complexity of its landscape from Atlantic coast to midlands. The policy distinguishes between areas under urban influence (around Galway City, Tuam, Ballinasloe), areas with strong rural character, Gaeltacht areas, and remote/island communities. Each zone has different criteria for local needs.",
      },
      {
        title: "Gaeltacht Areas — Additional Requirements",
        detail:
          "Significant parts of Galway County are Irish-speaking Gaeltacht areas, including Connemara, the Aran Islands, and South Galway. These areas fall under the Gaeltacht Act 2012 and Údarás na Gaeltachta remit. Development plans for these areas must align with the Language Planning Process. Signage, planning notices, and some formal documentation may be required in Irish. The planning authority may consult Údarás na Gaeltachta on applications in these areas.",
      },
      {
        title: "Scenic Landscape Designations",
        detail:
          "Galway has extensive scenic landscape and natural heritage designations, including the Twelve Bens, Maumturk Mountains, Connemara National Park, and the South Galway karst lowlands. These areas have a very high bar for new residential development. Visual impact, siting below the skyline, and use of natural materials are all required.",
      },
    ],
    warnings: [
      {
        text: "Connemara is extensively covered by Natura 2000 designations (SAC and SPA). Applications within or adjacent to these areas require Appropriate Assessment screening. Some areas may require a full Natura Impact Statement, which significantly increases the cost and duration of the planning process.",
      },
      {
        text: "Aran Islands applications are treated separately with island-specific policies. Access, servicing, and material considerations are different from the mainland. Always contact Galway County Council's islands section before commencing design.",
      },
      {
        text: "Galway City is a major growth centre under the National Planning Framework. The city environs — particularly around Knocknacarra, Doughiska, and the N6 corridor — are subject to detailed local area plans with specific density and infrastructure requirements.",
      },
    ],
    links: [
      {
        label: "Galway County Development Plan",
        url: "https://www.galway.ie/en/services/planning/countydevelopmentplan/",
      },
      {
        label: "Galway City Development Plan",
        url: "https://www.galwaycity.ie/planning/development-plan/",
      },
      {
        label: "Galway County Planning Department",
        url: "https://www.galway.ie/en/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application — Galway County Council",
        url: "https://www.galway.ie/en/services/planning/planningapplications/",
        description: "Standard planning application form for Galway County",
      },
      {
        label: "Planning Application — Galway City Council",
        url: "https://www.galwaycity.ie/planning/planning-applications/",
        description: "Standard planning application form for Galway City",
      },
    ],
  },

  Kerry: {
    countyName: "Kerry",
    policies: [
      {
        title: "Tourist Pressure Areas — Restrictions on Rural Housing",
        detail:
          "Kerry County Development Plan identifies Tourist Pressure Areas around the Ring of Kerry, Dingle Peninsula, and Killarney environs. Within these areas, applications for rural one-off dwellings face additional scrutiny to prevent further proliferation of tourist-driven rural housing. Applicants must demonstrate genuine permanent residential need rather than proximity to tourist infrastructure.",
      },
      {
        title: "Areas of Outstanding Natural Beauty",
        detail:
          "Kerry has some of Ireland's most extensive AONB designations, covering the MacGillycuddy's Reeks, the Dingle Peninsula, the Iveragh Peninsula, and the Beara Peninsula border area. Within AONBs, new dwellings must demonstrate exceptional local need, superior design, and minimal visual impact. Ridge and hilltop siting is refused. Traditional materials — natural stone, slate roofing — are preferred.",
      },
      {
        title: "Gaeltacht Areas — Irish Language Requirements",
        detail:
          "The Corca Dhuibhne (Dingle Peninsula) Gaeltacht and parts of Iveragh are designated Irish-speaking areas. Planning applications within these areas may require documentation in Irish, Irish-language signage, and may involve consultation with Údarás na Gaeltachta. The planning authority will consider the impact of development on the social and linguistic character of these communities.",
      },
      {
        title: "Killarney National Park Buffer Zone",
        detail:
          "Killarney National Park — Ireland's first national park — has a significant buffer zone in which development is strictly controlled. Any development that may affect the park's ecology, water quality (particularly for Lough Leane), or visitor experience is subject to Natural Heritage Area and SAC assessment requirements.",
      },
    ],
    warnings: [
      {
        text: "Kerry has some of the most sensitive landscapes in Ireland. Applications in tourist pressure areas or AONBs without a robust local needs case and high-quality design response are very likely to be refused.",
      },
      {
        text: "The Wild Atlantic Way route passes through Kerry. Developments with potential visual impact on the designated route's viewsheds are assessed against the Wild Atlantic Way Visitor Experience Development Plan.",
      },
      {
        text: "Flooding is a significant issue in low-lying areas around Tralee Bay, Castlemaine Harbour, and the Laune Valley. All applications in potentially flood-prone areas must be accompanied by a site-specific flood risk assessment consistent with the OPW Guidelines.",
      },
    ],
    links: [
      {
        label: "Kerry County Development Plan",
        url: "https://www.kerrycoco.ie/planning/county-development-plan/",
      },
      {
        label: "Kerry Planning Department",
        url: "https://www.kerrycoco.ie/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Kerry County Council",
        url: "https://www.kerrycoco.ie/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

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

  Kilkenny: {
    countyName: "Kilkenny",
    policies: [
      {
        title: "Kilkenny City Medieval Heritage Protection",
        detail:
          "Kilkenny City is Ireland's best-preserved medieval city. The city centre is an Architectural Conservation Area and contains an exceptionally high concentration of Protected Structures. Development within the medieval core is subject to the most stringent heritage standards in the country. Demolition, replacement, or significant alteration to historic fabric will require detailed Conservation Reports prepared by a qualified Conservation Architect.",
      },
      {
        title: "Archaeological Zones — City & County",
        detail:
          "In addition to the city's medieval archaeology, Kilkenny County has numerous Zones of Archaeological Potential, particularly around monastic sites (Jerpoint Abbey, Kilcooley Abbey) and tower houses. Development in or adjacent to any Zone of Archaeological Potential requires pre-application consultation with the National Monuments Service and may require test excavation as a pre-planning condition.",
      },
      {
        title: "Rural Housing Policy",
        detail:
          "Kilkenny County Development Plan requires demonstration of genuine local housing need for rural one-off dwellings. The county is divided into settlement tiers, with stricter controls around the commuter-pressure areas close to Kilkenny City and the M9 motorway corridor. The Nore Valley and Barrow Valley have additional landscape sensitivity policies.",
      },
    ],
    warnings: [
      {
        text: "Any works to Protected Structures in Kilkenny City require a Ministerial Exemption, or planning permission with a detailed Conservation Report. Unauthorised works to Protected Structures are among the most serious planning enforcement matters — they can result in requirements to reverse works at the owner's cost.",
      },
      {
        text: "The Record of Protected Structures (RPS) for Kilkenny City & County is one of the largest in Ireland. Always search the RPS before commencing any design work on an existing building.",
      },
      {
        text: "Kilkenny's tourism-sensitive areas — particularly around Kilkenny Castle and the Medieval Mile — have specific design guidelines that apply to all new development in the vicinity. Bland or incongruous modern interventions will face strong opposition.",
      },
    ],
    links: [
      {
        label: "Kilkenny County Development Plan",
        url: "https://www.kilkennycoco.ie/eng/services/planning/development-plan/",
      },
      {
        label: "Kilkenny Planning Department",
        url: "https://www.kilkennycoco.ie/eng/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Kilkenny County Council",
        url: "https://www.kilkennycoco.ie/eng/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Laois: {
    countyName: "Laois",
    policies: [
      {
        title: "Rural Housing — Local Needs Policy",
        detail:
          "Laois County Development Plan requires applicants for rural one-off dwellings to demonstrate genuine local housing need. The county distinguishes between areas under Dublin commuter pressure (the Portlaoise, Portarlington, and Mountmellick corridors near the M7/M8) and more rural areas. In commuter-pressure areas, the policy is applied more strictly.",
      },
      {
        title: "Portlaoise as a National Growth Centre",
        detail:
          "Portlaoise is designated as a regional growth centre under the National Planning Framework. This means there is a strong policy presumption in favour of residential intensification within and adjacent to Portlaoise town, rather than new rural development in its hinterland. Applications for large-scale rural housing in the Portlaoise catchment should be tested against the availability of serviced land within the town.",
      },
      {
        title: "Slieve Bloom Mountains — Special Amenity Area",
        detail:
          "The Slieve Bloom Mountains, shared with Offaly, have a Landscape Special Amenity designation. Development within this area requires a detailed landscape impact assessment. The area is also rich in blanket bog and upland habitats, and applications near upland areas may require ecological screening under the Habitats Directive.",
      },
    ],
    warnings: [
      {
        text: "The M7/M8 motorway has made Laois very accessible from Dublin. Applications for rural dwellings that appear to be primarily commuter-driven — particularly close to motorway junctions — will face close scrutiny and a strong local needs case is required.",
      },
      {
        text: "Laois has a number of SAC-designated rivers, including the Erkina and the Nore tributaries. Applications near watercourses may require ecological assessment and will be referred to Inland Fisheries Ireland.",
      },
    ],
    links: [
      {
        label: "Laois County Development Plan",
        url: "https://www.laois.ie/departments/planning/county-development-plan/",
      },
      {
        label: "Laois Planning Department",
        url: "https://www.laois.ie/departments/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Laois County Council",
        url: "https://www.laois.ie/departments/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Leitrim: {
    countyName: "Leitrim",
    policies: [
      {
        title: "Strict Local Needs Policy — Protecting Rural Character",
        detail:
          "Leitrim County Development Plan has one of the strictest local needs policies in Ireland, reflecting the county's small population and concern about second homes and holiday use displacing local communities. Applicants must demonstrate a strong and genuine connection to the locality — native rural dwellers, those with family land, or those with rural employment. The policy is applied consistently and refusals are frequent where the connection is tenuous.",
      },
      {
        title: "Landscape Designations — Lough Allen & Iron Mountains",
        detail:
          "Leitrim has significant landscape designations around Lough Allen, the Iron Mountains, and the Sliabh an Iarainn uplands. These areas are subject to strict siting and design requirements. Development on exposed ridgelines or hilltops is refused. Lough Allen is also a significant tourism and recreation amenity and development near its shoreline is strictly controlled.",
      },
      {
        title: "Shannon-Erne Waterway & Lakeland Policy",
        detail:
          "Leitrim's position at the meeting of the Shannon and Erne systems means much of the county is within or adjacent to sensitive aquatic habitats. Development within riparian zones must comply with water quality protection measures and will be referred to Inland Fisheries Ireland. Boat yard and marina development on the waterway has its own specific policy framework.",
      },
    ],
    warnings: [
      {
        text: "Leitrim's local needs policy is strictly applied. Applications from urban dwellers, retirees with no county connection, or from those who have lived away from the county for extended periods face significant risk of refusal. A pre-application consultation with the planning department is strongly recommended.",
      },
      {
        text: "Leitrim has the smallest population of any county in Ireland. The planning authority is acutely aware of pressure from holiday home and investment property development and will scrutinise applications accordingly.",
      },
    ],
    links: [
      {
        label: "Leitrim County Development Plan",
        url: "https://www.leitrimcoco.ie/eng/Services_A-Z/Planning/County-Development-Plan/",
      },
      {
        label: "Leitrim Planning Department",
        url: "https://www.leitrimcoco.ie/eng/Services_A-Z/Planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Leitrim County Council",
        url: "https://www.leitrimcoco.ie/eng/Services_A-Z/Planning/Planning-Applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Limerick: {
    countyName: "Limerick",
    policies: [
      {
        title: "Split Jurisdiction — Limerick City & County Council",
        detail:
          "Limerick City and County merged into a single local authority — Limerick City and County Council — in 2014. However, distinct city and county development frameworks still apply within the single authority. Limerick City has urban density requirements, Part V obligations, and city-specific design standards. The county area applies rural settlement policies. Always confirm whether the site is within the city or county planning area.",
      },
      {
        title: "Limerick City — Regeneration Areas",
        detail:
          "Limerick City has designated regeneration areas in Southill, Moyross, Ballinacurra Weston, and St. Mary's Park. Development in these areas is supported under the Limerick Regeneration Framework and may benefit from reduced Part V requirements and streamlined pre-application processes. Understanding which regeneration area a site falls within is important for viability assessment.",
      },
      {
        title: "Rural Housing Policy — County Area",
        detail:
          "Limerick County has a standard rural settlement policy requiring demonstration of local housing need. Areas under pressure from Limerick City commuting — particularly the Adare, Patrickswell, and Croom corridors — apply stricter criteria. More remote areas in West Limerick and the Mullaghareirk Mountains apply a more permissive approach.",
      },
    ],
    warnings: [
      {
        text: "The Shannon Estuary is a major industrial and ecological asset. Development near the estuary — particularly in the Shannon Free Zone and industrial corridor — involves multiple statutory consultees including the Shannon Foynes Port Company and the Marine Survey Office.",
      },
      {
        text: "Lough Gur is a National Monument site with extensive archaeological protections. Applications within the Lough Gur Special Amenity Area require detailed archaeological assessment.",
      },
    ],
    links: [
      {
        label: "Limerick Development Plan",
        url: "https://www.limerick.ie/council/services/planning/development-plan",
      },
      {
        label: "Limerick Planning Department",
        url: "https://www.limerick.ie/council/services/planning",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Limerick City & County Council",
        url: "https://www.limerick.ie/council/services/planning/planning-applications",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Longford: {
    countyName: "Longford",
    policies: [
      {
        title: "Rural Housing Policy — Relatively Straightforward",
        detail:
          "Longford County Development Plan has a rural housing policy broadly in line with the 2005 Sustainable Rural Housing Guidelines. As one of the least pressured counties for commuter development, the policy is applied more reasonably than in counties adjacent to Dublin. Applicants with a genuine local connection — family land, employment in the area, or long residence — generally have a reasonable prospect of permission.",
      },
      {
        title: "Lough Ree & Lakeland Designations",
        detail:
          "The western edge of Longford borders Lough Ree, which is an SAC and SPA of international importance. Development within the Lough Ree catchment requires adherence to water quality protection measures. Shoreline and near-shore development is strictly controlled. Any application within 200m of Lough Ree or any of its tributary rivers will be referred to the NPWS and Inland Fisheries Ireland.",
      },
      {
        title: "Longford Town — Urban Growth",
        detail:
          "Longford town is the county's primary urban centre and is identified for growth under regional spatial planning. The town has serviced land available for residential development. Applications for large-scale rural housing in close proximity to the town will be tested against the availability of urban serviced land.",
      },
    ],
    warnings: [
      {
        text: "The Royal Canal corridor runs through Longford and is a protected linear amenity. Development adjacent to the Royal Canal towpath requires consultation with Waterways Ireland and must not obstruct public access along the canal.",
      },
      {
        text: "Longford has areas of cutover bog, some of which have been transferred from Bord na Móna to NPWS management. Applications near former boglands may require ecological screening for protected habitats.",
      },
    ],
    links: [
      {
        label: "Longford County Development Plan",
        url: "https://www.longfordcoco.ie/services/planning/development-plan/",
      },
      {
        label: "Longford Planning Department",
        url: "https://www.longfordcoco.ie/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Longford County Council",
        url: "https://www.longfordcoco.ie/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Louth: {
    countyName: "Louth",
    policies: [
      {
        title: "Urban Pressure — Drogheda & Dundalk Growth Centres",
        detail:
          "Louth is Ireland's smallest county and is heavily urbanised around Drogheda and Dundalk. Both towns are designated as key growth centres under the National Planning Framework. Urban residential applications in these centres are expected to achieve higher densities and must comply with Part V obligations. The rural hinterland is under significant pressure from both centres.",
      },
      {
        title: "Rural Housing — Strict Policy Near Urban Centres",
        detail:
          "Given the county's small size and the urban influence extending into virtually all rural areas, the rural housing policy is applied strictly throughout Louth. The entire county is effectively under urban influence, and genuine local needs applications must demonstrate a connection to rural employment or family land that cannot be served by urban housing.",
      },
      {
        title: "Boyne Estuary & Coastal Zone",
        detail:
          "The Boyne Estuary is an SAC and SPA. The coastal zone around Baltray, Termonfeckin, and Clogherhead is subject to coastal management policies. Development in the coastal strip requires a Coastal Impact Assessment and will be referred to the Marine Survey Office. Flood risk assessment is mandatory for all sites within the OPW flood mapping extents.",
      },
    ],
    warnings: [
      {
        text: "Louth's small size means virtually no part of the county is truly remote from urban influence. Rural housing applications face a consistently high bar for local needs justification.",
      },
      {
        text: "Drogheda straddles the Louth/Meath county boundary. Confirm which planning authority has jurisdiction for sites in the Drogheda area — some areas on the south bank of the Boyne fall within Meath's jurisdiction.",
      },
      {
        text: "The M1 motorway corridor creates strong development pressure. Applications for rural housing or commercial development in the vicinity of M1 junctions will be assessed against transport and sustainability criteria.",
      },
    ],
    links: [
      {
        label: "Louth County Development Plan",
        url: "https://www.louthcoco.ie/en/services/planning/county-development-plan/",
      },
      {
        label: "Louth Planning Department",
        url: "https://www.louthcoco.ie/en/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Louth County Council",
        url: "https://www.louthcoco.ie/en/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Mayo: {
    countyName: "Mayo",
    policies: [
      {
        title: "Strong Rural Settlement Policy",
        detail:
          "Mayo County Development Plan has a strongly articulated rural settlement policy that prioritises the needs of rural dwellers — particularly in remote and structurally weak areas. The county classifies its rural areas into settlement tiers, with the most remote areas of North Mayo, Erris, and the Mullet Peninsula applying the most permissive approach to facilitate rural repopulation and retention of rural communities.",
      },
      {
        title: "Areas of Outstanding Natural Beauty — Extensive Coverage",
        detail:
          "Mayo has some of Ireland's most spectacular and protected landscapes. The Nephin Beg Range, Croagh Patrick, Clew Bay, Achill Island, and the north Mayo coast (including the Wild Atlantic Way route) are all designated as AONBs or high-value landscapes. Within these areas, development is restricted to genuine local needs with a high bar on design quality, siting, and materials. White painted rendered houses are generally not acceptable in sensitive landscape areas.",
      },
      {
        title: "Belmullet & Erris Peninsula — Remote Area Policy",
        detail:
          "The Erris Peninsula and Belmullet area are among the most remote in Ireland and are specifically identified in the development plan as structurally weak areas suffering from population decline. A more permissive approach to rural housing is deliberately applied here to encourage people to live and work in the area.",
      },
    ],
    warnings: [
      {
        text: "Achill Island and Clare Island have island-specific planning considerations. Access, infrastructure capacity, and visual impact on internationally recognised landscapes are primary concerns. Pre-application consultation with Mayo County Council's planning department is strongly recommended for any island development.",
      },
      {
        text: "The Wild Atlantic Way route traverses virtually the entire Mayo coastline. Developments with visual impact on the WAW experience zone are assessed against the WAW Visitor Experience Development Plan and may require WAW impact assessment.",
      },
      {
        text: "Mayo has extensive SAC and SPA coverage, particularly around Clew Bay, Killala Bay, and the blanket boglands of north and west Mayo. Applications in or adjacent to Natura 2000 sites require Appropriate Assessment screening.",
      },
    ],
    links: [
      {
        label: "Mayo County Development Plan",
        url: "https://www.mayo.ie/planning/county-development-plan",
      },
      {
        label: "Mayo Planning Department",
        url: "https://www.mayo.ie/planning",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Mayo County Council",
        url: "https://www.mayo.ie/planning/planning-applications",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Meath: {
    countyName: "Meath",
    policies: [
      {
        title: "Strict Rural Housing — Dublin Commuter Pressure",
        detail:
          "Meath County Development Plan applies one of the stricter rural housing policies of the commuter belt counties. The entire county is under urban influence from Dublin, and the planning authority is acutely aware of the need to resist commuter-driven rural development. Applicants must demonstrate genuine and specific local housing need — a rural Meath family connection or rural employment — that cannot be met by housing in the county's urban settlements.",
      },
      {
        title: "Boyne Valley UNESCO World Heritage Nomination Area",
        detail:
          "The Boyne Valley — including Newgrange, Knowth, Dowth, and the wider archaeological landscape — is nominated for UNESCO World Heritage Site status. Development within the nominated World Heritage Site buffer zone is subject to the most stringent heritage and visual impact requirements. Any application that could affect views from, or the setting of, the Newgrange/Knowth complex requires consultation with the National Monuments Service and a detailed Archaeological and Visual Impact Assessment.",
      },
      {
        title: "Metropolitan Greenbelt & Settlement Strategy",
        detail:
          "Meath's settlement strategy is designed to direct growth into designated settlements (Navan, Ashbourne, Trim, Kells) and to protect the green belt separating Meath settlements from the Dublin metropolitan area. The Ashbourne and Ratoath areas, being closest to Dublin, have the most restrictive rural policies of any part of the county.",
      },
    ],
    warnings: [
      {
        text: "The Boyne Valley buffer zone must be checked before any development proposal near the M1/N51 corridor east of Navan. Development that impacts the setting of the scheduled monuments at Newgrange or Knowth is virtually impossible to gain consent for.",
      },
      {
        text: "Meath has experienced significant development pressure over the past two decades. The planning authority has a strong track record of refusing rural housing applications that do not meet the local needs criteria. Pre-application consultation is strongly recommended.",
      },
      {
        text: "The M1, M2, and M3 motorway corridors create significant commuter pressure across the county. Applications near motorway junctions for rural dwellings will face the highest scrutiny.",
      },
    ],
    links: [
      {
        label: "Meath County Development Plan",
        url: "https://www.meath.ie/council/planning/county-development-plan/",
      },
      {
        label: "Meath Planning Department",
        url: "https://www.meath.ie/council/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Meath County Council",
        url: "https://www.meath.ie/council/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Monaghan: {
    countyName: "Monaghan",
    policies: [
      {
        title: "Rural Housing — Border County Context",
        detail:
          "Monaghan County Development Plan has a rural housing policy that acknowledges the county's border status and cross-border family connections. As with Cavan, applicants with strong Northern Ireland family connections to County Monaghan land may be considered under local needs criteria. The policy is applied relatively reasonably given the county's rural character and the absence of major urban centres.",
      },
      {
        title: "Drumlin Landscape — Siting Requirements",
        detail:
          "Monaghan is characterised by its drumlin landscape — small rounded hills separated by lakes and wetlands. The drumlin pattern is a key part of the county's natural character and new development must respond to this topography. Dwellings should be sited on lower slopes, tucked into hollows, or positioned to use existing vegetation as backdrop. Hilltop and exposed ridge sites are refused.",
      },
      {
        title: "Market Towns — Monaghan, Clones, Castleblayney",
        detail:
          "Monaghan's market towns are the focus of commercial and residential growth. The development plan supports residential intensification within the defined town development boundaries. Rural housing applications within easy commuting distance of these towns must demonstrate a genuine need that cannot be met by urban housing.",
      },
    ],
    warnings: [
      {
        text: "Monaghan's lakeland and wetland areas are ecologically sensitive. Applications near any lake, turlough, or wetland habitat require ecological assessment and will likely be referred to the NPWS.",
      },
      {
        text: "Cross-border infrastructure projects (roads, utilities) in border counties like Monaghan may require coordination between Irish and Northern Ireland planning authorities. Always check whether a proposed development is near a cross-border infrastructure corridor.",
      },
    ],
    links: [
      {
        label: "Monaghan County Development Plan",
        url: "https://www.monaghancoco.ie/services/planning/county-development-plan/",
      },
      {
        label: "Monaghan Planning Department",
        url: "https://www.monaghancoco.ie/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Monaghan County Council",
        url: "https://www.monaghancoco.ie/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Offaly: {
    countyName: "Offaly",
    policies: [
      {
        title: "Bord na Móna Boglands — Environmental Restrictions",
        detail:
          "Offaly contains extensive areas of Midland raised bog, much of it formerly managed by Bord na Móna. Many of these boglands are now SACs under EU Habitats Directive and are being rehabilitated under the Bord na Móna Peatlands Climate Action programme. Development on, adjacent to, or in the catchment of active raised bogs is subject to Habitats Directive Appropriate Assessment. Any disturbance of bog drainage or hydrology requires NPWS assessment.",
      },
      {
        title: "Clara Bog & Natura 2000 Network",
        detail:
          "Clara Bog near Tullamore is one of the largest intact raised bogs in Ireland and is a Special Area of Conservation. It is also an EU Special Protection Area. Development within or adjacent to Clara Bog or other SAC-designated bogs in Offaly requires a full Appropriate Assessment and will face strong scrutiny from the National Parks and Wildlife Service.",
      },
      {
        title: "Rural Housing Policy — Midlands",
        detail:
          "Offaly's rural housing policy broadly follows national guidelines with a local needs requirement. The areas around Tullamore and Edenderry face greater urban pressure and apply stricter criteria. More remote parts of the county — particularly in the west bordering Galway — are treated with greater flexibility.",
      },
    ],
    warnings: [
      {
        text: "Bog designations in Offaly are extensive and not always immediately obvious. Always check the NPWS Natura 2000 site maps before proposing any development in the midlands lowlands. The hydrological catchment of a bog can extend several kilometres beyond its visible edge.",
      },
      {
        text: "Bord na Móna land ownership is complex and in transition. Land that appears vacant or agricultural may be subject to restoration obligations or transferred to NPWS management. Confirm land ownership and status before any site selection.",
      },
    ],
    links: [
      {
        label: "Offaly County Development Plan",
        url: "https://www.offaly.ie/eng/Services/Planning/County-Development-Plan/",
      },
      {
        label: "Offaly Planning Department",
        url: "https://www.offaly.ie/eng/Services/Planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Offaly County Council",
        url: "https://www.offaly.ie/eng/Services/Planning/Planning-Applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Roscommon: {
    countyName: "Roscommon",
    policies: [
      {
        title: "Strong Local Needs Policy",
        detail:
          "Roscommon County Development Plan has a clearly articulated local needs policy for rural housing that distinguishes between those with a family connection to the land, those employed in rural areas, and other genuine rural needs. The policy reflects the county's predominantly rural character and the desire to maintain rural communities.",
      },
      {
        title: "Lough Ree & Lough Key — Lakeland Designations",
        detail:
          "Roscommon borders Lough Ree (an SAC and SPA) and contains Lough Key Forest Park, a major recreational amenity. Development within the catchment of these water bodies is subject to strict water quality protection policies. Lakeshore and near-shore development requires detailed justification and ecological assessment.",
      },
      {
        title: "Ballaghaderreen, Roscommon Town & Castlerea — Urban Centres",
        detail:
          "The development plan directs residential and commercial growth into the county's main urban settlements. Applications for rural housing within easy commuting distance of these towns require a stronger local needs case than applications in more remote parts of the county.",
      },
    ],
    warnings: [
      {
        text: "The western part of Roscommon borders the Connacht lake district. Applications near any lake or significant watercourse in this area require ecological screening and may require Appropriate Assessment screening under the Habitats Directive.",
      },
      {
        text: "Roscommon has a significant legacy of traditional farmhouses and vernacular architecture. Extensions and renovations that fail to respond appropriately to the existing built form may face refusal on visual impact grounds.",
      },
    ],
    links: [
      {
        label: "Roscommon County Development Plan",
        url: "https://www.roscommoncoco.ie/en/services/planning/county-development-plan/",
      },
      {
        label: "Roscommon Planning Department",
        url: "https://www.roscommoncoco.ie/en/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Roscommon County Council",
        url: "https://www.roscommoncoco.ie/en/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Sligo: {
    countyName: "Sligo",
    policies: [
      {
        title: "Coastal Zone — Restrictions on Development",
        detail:
          "Sligo's Atlantic coastline — from Mullaghmore in the north to Enniscrone in the south — is subject to Coastal Zone Management policies. Development within 300m of the high water mark requires a Coastal Impact Assessment. The Sligo coastline includes several Blue Flag beaches and designated recreational zones where additional restrictions apply.",
      },
      {
        title: "Benbulben & Ben Whiskin — Natural Heritage Area",
        detail:
          "The Benbulben, Gleniff, and Ben Whiskin upland area is a Natural Heritage Area (NHA) and contains internationally important calcareous grassland and cliff habitats. Development within or adjacent to this area is subject to detailed ecological assessment requirements. The area is also associated with W.B. Yeats and has significant cultural heritage status. Visual impact on the Benbulben tabletop profile is assessed for developments across a wide area of north Sligo.",
      },
      {
        title: "Rural Housing Policy",
        detail:
          "Sligo County Development Plan has a rural housing policy broadly in line with national guidelines, with local needs requirements. The areas around Sligo town and the N4/N17 corridor are under urban pressure and apply stricter rural housing criteria. North and west Sligo are treated with greater flexibility given lower population pressure.",
      },
    ],
    warnings: [
      {
        text: "The iconic profile of Benbulben is visible across a very wide area of north Sligo and into parts of Leitrim. Any development that may appear against the Benbulben skyline when viewed from public roads or amenity areas will face visual impact objections.",
      },
      {
        text: "Sligo Bay and the Ballysadare Bay area are designated as SAC and SPA. Applications adjacent to these estuaries require Appropriate Assessment screening and are routinely referred to the NPWS.",
      },
      {
        text: "Flooding is a significant issue in Sligo town and along the Garavogue River corridor. Flood risk assessment is mandatory for all applications within the OPW flood mapping extents.",
      },
    ],
    links: [
      {
        label: "Sligo County Development Plan",
        url: "https://www.sligococo.ie/services/planning/county-development-plan/",
      },
      {
        label: "Sligo Planning Department",
        url: "https://www.sligococo.ie/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Sligo County Council",
        url: "https://www.sligococo.ie/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Tipperary: {
    countyName: "Tipperary",
    policies: [
      {
        title: "Rural Housing — Relatively Straightforward Policy",
        detail:
          "Tipperary County Development Plan has a rural housing policy that broadly follows the national Sustainable Rural Housing Guidelines. As a large and predominantly agricultural county with lower development pressure than coastal or Dublin-adjacent counties, the policy is applied with greater flexibility. Applicants with genuine local connections — family land, agricultural employment, or long county residence — generally have reasonable prospects.",
      },
      {
        title: "Glen of Aherlow & Tipperary Uplands",
        detail:
          "The Glen of Aherlow, the Galtee Mountains, and the Knockmealdown Mountains are designated high-value landscapes with NHA status in parts. Development within these areas requires detailed landscape impact assessment. The Galtee Mountains are an SAC, and applications adjacent to upland areas require ecological screening.",
      },
      {
        title: "Cashel Rock — Heritage Site Protections",
        detail:
          "The Rock of Cashel is a National Monument and one of Ireland's most significant heritage sites. The setting of the Rock is protected across a wide area of south Tipperary. Development that could affect views of or from the Rock requires detailed visual impact assessment and consultation with the National Monuments Service.",
      },
    ],
    warnings: [
      {
        text: "Tipperary straddles the Suir and Nore river catchments, both of which are SAC-designated. All applications near watercourses require water quality assessment and ecological screening.",
      },
      {
        text: "Parts of Tipperary experience karst groundwater conditions, particularly in the Golden Vale area. Site-specific hydrogeological assessment may be required before a wastewater treatment system can be designed.",
      },
    ],
    links: [
      {
        label: "Tipperary County Development Plan",
        url: "https://www.tipperarycoco.ie/planning/county-development-plan",
      },
      {
        label: "Tipperary Planning Department",
        url: "https://www.tipperarycoco.ie/planning",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Tipperary County Council",
        url: "https://www.tipperarycoco.ie/planning/planning-applications",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Waterford: {
    countyName: "Waterford",
    policies: [
      {
        title: "Split Jurisdiction — Waterford City & County Council",
        detail:
          "Following local government reform, Waterford City and County Council is a single authority but maintains distinct city and county planning frameworks. Waterford City — Ireland's oldest city — has strong heritage policies and urban density requirements. The county area applies rural settlement policies. The North Quays Strategic Development Zone in Waterford City is a priority regeneration area.",
      },
      {
        title: "Waterford City — Viking Heritage & Protected Structures",
        detail:
          "Waterford's Viking and medieval heritage is protected under an extensive Archaeological Conservation Zone in the city centre. The Viking Triangle area has specific design guidelines requiring all development to respect the historic urban grain. Unauthorised works within the Archaeological Conservation Zone are a serious enforcement matter.",
      },
      {
        title: "Coastal Management — Copper Coast & Waterford Harbour",
        detail:
          "The Copper Coast UNESCO Global Geopark (between Tramore and Dungarvan) has geological and landscape designations that restrict development along this coastline. Waterford Harbour is a key shipping route and SAC. Development near the harbour or the Copper Coast requires detailed environmental impact consideration.",
      },
    ],
    warnings: [
      {
        text: "The Copper Coast Geopark designation creates additional assessment requirements for development in coastal areas between Tramore and Dungarvan. Always check the Geopark boundary before designing coastal projects.",
      },
      {
        text: "The North Quays SDZ is an active Strategic Development Zone with its own planning scheme. Any development within the North Quays boundary is governed by the SDZ scheme rather than the city development plan. Confirm SDZ status before proceeding.",
      },
    ],
    links: [
      {
        label: "Waterford City & County Development Plan",
        url: "https://www.waterfordcouncil.ie/departments/planning/development-plan/",
      },
      {
        label: "Waterford Planning Department",
        url: "https://www.waterfordcouncil.ie/departments/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Waterford City & County Council",
        url: "https://www.waterfordcouncil.ie/departments/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Westmeath: {
    countyName: "Westmeath",
    policies: [
      {
        title: "Lough Ree & Lough Derravaragh — Ecological Restrictions",
        detail:
          "Westmeath's landscape is defined by its lakes. Lough Ree is an SAC and SPA of international importance shared with Roscommon and Longford. Lough Derravaragh and Lough Owel are also designated water bodies. All development within the catchment of these lakes is subject to strict water quality protection requirements. Shoreline and near-shore development faces a very high bar.",
      },
      {
        title: "Athlone — Gateway Town",
        detail:
          "Athlone is designated as a regional growth centre under the National Planning Framework and a key driver of midlands growth. The development plan supports intensification within the Athlone town boundary. The Athlone Core Strategy directs higher-density residential development to the town centre and brownfield lands. Rural applications in the Athlone hinterland must demonstrate genuine local needs that cannot be met by urban housing.",
      },
      {
        title: "Rural Housing Policy — Midlands County",
        detail:
          "Westmeath's rural housing policy broadly follows national guidelines. The areas around Athlone, Mullingar, and Moate face urban pressure and apply stricter criteria. More rural parts of the county — particularly north and east Westmeath — are treated with greater flexibility.",
      },
    ],
    warnings: [
      {
        text: "Lough Ree and Lough Derravaragh have exceptionally sensitive ecology. Any septic tank or wastewater system within the lakeland catchment requires careful hydrogeological assessment. The planning authority will refuse applications where there is any risk of phosphate or nitrate leachate entering the lake system.",
      },
      {
        text: "The Royal Canal, which passes through Westmeath, is a protected linear heritage amenity. Development adjacent to the canal requires consultation with Waterways Ireland.",
      },
    ],
    links: [
      {
        label: "Westmeath County Development Plan",
        url: "https://www.westmeathcoco.ie/en/services/planning/county-development-plan/",
      },
      {
        label: "Westmeath Planning Department",
        url: "https://www.westmeathcoco.ie/en/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Westmeath County Council",
        url: "https://www.westmeathcoco.ie/en/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Wexford: {
    countyName: "Wexford",
    policies: [
      {
        title: "Coastal Zone Management — Extensive Restrictions",
        detail:
          "Wexford has a long and varied coastline including the Wexford Harbour & Slobs, the Saltee Islands, Hook Head Peninsula, and the Bannow Bay estuary. Coastal Zone Management policies restrict development within 300m of the high water mark. The Wexford Slobs are a Ramsar Convention Wetland and SAC/SPA of international significance — any development in the North or South Slobs catchment faces the highest environmental scrutiny.",
      },
      {
        title: "Wexford Harbour & Sloblands — Ramsar Site",
        detail:
          "The Wexford Wildfowl Reserve and Sloblands are a Ramsar Wetland and Biosphere Reserve. Development that could affect the hydrology, water quality, or ecology of the sloblands is subject to Habitats Directive Appropriate Assessment. The reserve supports internationally important populations of wintering Greenland White-fronted Geese. No development in the catchment should be permitted without a full ecological assessment.",
      },
      {
        title: "Rural Housing Policy",
        detail:
          "Wexford County Development Plan requires demonstration of genuine local housing need for rural one-off dwellings. The proximity of the county to Waterford city and the growing commuter catchment from the south Dublin/Wicklow area creates pressure in the north and west of the county. Areas around New Ross and Enniscorthy face greater scrutiny than more remote coastal areas.",
      },
    ],
    warnings: [
      {
        text: "The Wexford Slobs are among the most important wetland habitats in Ireland and Europe. Any development within the North or South Sloblands catchment will face intense scrutiny from NPWS and BirdWatch Ireland. This is not an area where planning permission for development is normally achievable.",
      },
      {
        text: "Saltee Islands and Hook Head are designated Natural Heritage Areas. Any development on or near these sites — including moorings and marine structures — requires NHA assessment.",
      },
    ],
    links: [
      {
        label: "Wexford County Development Plan",
        url: "https://www.wexfordcoco.ie/services/planning/county-development-plan/",
      },
      {
        label: "Wexford Planning Department",
        url: "https://www.wexfordcoco.ie/services/planning/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Wexford County Council",
        url: "https://www.wexfordcoco.ie/services/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },

  Wicklow: {
    countyName: "Wicklow",
    policies: [
      {
        title: "Strict Rural Housing — Dublin Proximity",
        detail:
          "Wicklow County Development Plan has a strict rural housing policy, reflecting the county's position as the closest rural county to Dublin. The planning authority is highly conscious of the risk of Dublin housing pressure being displaced into Wicklow's rural areas. Applicants must demonstrate an enduring and specific local connection to the rural area — family land, agricultural employment, or demonstrated rural community ties over many years. Commuting convenience is explicitly not accepted as a justification.",
      },
      {
        title: "Wicklow Mountains National Park",
        detail:
          "Wicklow Mountains National Park covers a large area of upland Wicklow and is Ireland's largest national park. No planning permission can be granted for new development within the national park boundary except in exceptional circumstances for park management purposes. A substantial buffer zone around the park also applies strict development controls. Applications near the national park must consider visual impact, ecological connectivity, and public access.",
      },
      {
        title: "Areas of Outstanding Natural Beauty & Special Amenity Areas",
        detail:
          "In addition to the national park, Wicklow has several Areas of Outstanding Natural Beauty and Special Amenity Areas, including the Wicklow Gap, the Vale of Avoca, and the Bray/Greystones coastal zone. Development within AONBs requires detailed landscape impact assessment and the presumption is against new one-off rural dwellings.",
      },
    ],
    warnings: [
      {
        text: "Wicklow is effectively part of the Dublin Metropolitan Area for commuting purposes. Applications for rural housing that cannot clearly establish a local need independent of Dublin employment will face near-certain refusal.",
      },
      {
        text: "The national park boundary must be confirmed before any site is selected in the upland areas. Park boundary maps are available from the NPWS and from Wicklow County Council's mapping services. The boundary is not always immediately visible on the ground.",
      },
      {
        text: "Parts of Wicklow — particularly the Arklow area and south Wicklow coast — are under pressure from wind energy development. Always check for existing wind farm permissions and their buffer zones when selecting sites for residential development.",
      },
    ],
    links: [
      {
        label: "Wicklow County Development Plan",
        url: "https://www.wicklow.ie/planning/county-development-plan/",
      },
      {
        label: "Wicklow Planning Department",
        url: "https://www.wicklow.ie/planning/",
      },
      {
        label: "Wicklow Mountains National Park",
        url: "https://www.wicklowmountainsnationalpark.ie/",
      },
    ],
    sampleDocs: [
      {
        label: "Planning Application Form — Wicklow County Council",
        url: "https://www.wicklow.ie/planning/planning-applications/",
        description: "Standard planning application form and submission guidance",
      },
    ],
  },
};

// ─── Normalisation helpers ──────────────────────────────────────────────────────

const COUNCIL_NAME_MAP: Record<string, string> = {
  // Dublin area
  "Dublin City Council": "Dublin",
  "Dún Laoghaire-Rathdown County Council": "Dublin",
  "Fingal County Council": "Dublin",
  "South Dublin County Council": "Dublin",
  // Cork
  "Cork City Council": "Cork",
  "Cork County Council": "Cork",
  // Galway
  "Galway City Council": "Galway",
  "Galway County Council": "Galway",
  // Waterford
  "Waterford City and County Council": "Waterford",
  "Waterford City & County Council": "Waterford",
  // Limerick
  "Limerick City and County Council": "Limerick",
  "Limerick City & County Council": "Limerick",
  // Tipperary
  "Tipperary County Council": "Tipperary",
  // All other standard councils
  "Kildare County Council": "Kildare",
  "Donegal County Council": "Donegal",
  "Mayo County Council": "Mayo",
  "Kerry County Council": "Kerry",
  "Wicklow County Council": "Wicklow",
  "Meath County Council": "Meath",
  "Wexford County Council": "Wexford",
  "Kilkenny County Council": "Kilkenny",
  "Clare County Council": "Clare",
  "Louth County Council": "Louth",
  "Carlow County Council": "Carlow",
  "Laois County Council": "Laois",
  "Offaly County Council": "Offaly",
  "Westmeath County Council": "Westmeath",
  "Longford County Council": "Longford",
  "Roscommon County Council": "Roscommon",
  "Sligo County Council": "Sligo",
  "Leitrim County Council": "Leitrim",
  "Cavan County Council": "Cavan",
  "Monaghan County Council": "Monaghan",
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
  /**
   * Whether the current user has paid access.
   * - true  → full panel (all policies, warnings, links, docs)
   * - false → free tier: county name + first policy only + upgrade CTA
   * Defaults to false so callers that haven't loaded auth yet show the safe version.
   */
  isPaid?: boolean;
}

function handleUpgrade() {
  alert(
    "Payment is coming soon.\n\nTo get early access, email us at hello@planassist.ie and we\u2019ll set you up manually."
  );
}

export function CountyIntelPanel({ county, className = "", isPaid = false }: CountyIntelPanelProps) {
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
                {isPaid
                  ? `${data.warnings.length} warning${data.warnings.length !== 1 ? "s" : ""} \u00b7 ${data.policies.length} key ${data.policies.length !== 1 ? "policies" : "policy"}`
                  : "1 key policy shown \u00b7 upgrade for full intelligence"}
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
              {/* ── FREE TIER: show only first policy + upgrade CTA ── */}
              {!isPaid && (
                <div className="mt-4 space-y-3">
                  {/* First policy only */}
                  <div>
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Key county policy
                    </h3>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5">
                      <p className="text-sm font-semibold text-emerald-900 mb-1">{data.policies[0].title}</p>
                      <p className="text-sm text-emerald-800 leading-relaxed line-clamp-3">{data.policies[0].detail}</p>
                    </div>
                  </div>

                  {/* Upgrade CTA */}
                  <div className="bg-white border border-indigo-200 rounded-xl px-4 py-4 flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-indigo-900">
                        {data.policies.length - 1} more {data.policies.length - 1 === 1 ? "policy" : "policies"}, {data.warnings.length} critical {data.warnings.length === 1 ? "warning" : "warnings"} &amp; all document links
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Unlock the full Co. {data.countyName} intelligence panel for €39 or with an Architect subscription.
                      </p>
                      <button
                        type="button"
                        onClick={handleUpgrade}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Get full access — €39
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PAID TIER: full content ── */}
              {isPaid && (
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
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Key county policies
                  </h3>
                  <div className="space-y-2.5">
                    {data.policies.map((p, i) => (
                      <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5">
                        <p className="text-sm font-semibold text-emerald-900 mb-1">{p.title}</p>
                        <p className="text-sm text-emerald-800 leading-relaxed">{p.detail}</p>
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
                      Resources &amp; development plans
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
              )}
            </>
          ) : (
            /* ── Unknown county — fallback notice ── */
            <div className="mt-4 flex items-start gap-3 bg-white border border-indigo-200 rounded-xl px-4 py-4">
              <svg className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-indigo-900">County data unavailable</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                  County-specific planning intelligence for {county} could not be found. Planning intelligence is available for all 26 counties of the Republic of Ireland.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
