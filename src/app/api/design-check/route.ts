import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateCounty, badRequest, scanFields } from "@/lib/validation";
import { resolveUserTier, unauthorized, paymentRequired } from "@/lib/authGuard";

const client = new Anthropic();

// ─── Allowed image types ───────────────────────────────────────────────────────

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel serverless body limit headroom)

type AllowedMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

// ─── Result type ───────────────────────────────────────────────────────────────

export interface DesignCheckResult {
  alignmentLevel: "STRONG" | "MODERATE" | "CONCERNS";
  overallAssessment: string;
  positiveElements: string[];
  potentialConcerns: string[];
  recommendations: string[];
  countyNotes: string;
}

// ─── Valid project types ───────────────────────────────────────────────────────

const VALID_PROJECT_TYPES = new Set([
  "new-build-rural",
  "new-build-urban",
  "extension",
  "change-of-appearance",
]);

// ─── System prompt ─────────────────────────────────────────────────────────────

const DESIGN_CHECK_PROMPT = `You are an expert in Irish architectural design standards and planning design guidance. You have comprehensive knowledge of:
- The Sustainable Rural Housing Guidelines for Planning Authorities (DoEHLG, 2005) — design chapter
- Urban Design Manual: A Best Practice Guide (DEHLG, 2009)
- Urban Development and Building Height Guidelines (DHLGH, 2018)
- Design Standards for New Apartments (DHLGH, 2020 and 2023 updates)
- Each of the 26 Irish counties' published rural house design guides and development plan design objectives
- An Bord Pleanála design guidance and case law on design-related refusals
- Traditional Irish vernacular architecture — regional variations across all 26 counties
- Current best practice in sustainable and climate-adaptive design as it applies to Irish planning

YOUR TASK:
You are reviewing an uploaded image (photograph of existing building, sketch, rendered elevation, or site photograph) alongside information about the county and project type. Based on what you observe in the image, provide a structured design assessment aligned with Irish planning design guidance for that county and project type.

IMPORTANT: If the image is a rough sketch, a partial elevation, or a site photo without a clear proposed design, note this in your response and assess what you can observe, providing guidance appropriate to what is visible.

─── IRISH DESIGN PRINCIPLES BY PROJECT TYPE ──────────────────────────────────

NEW BUILD RURAL:
Key requirements under the Sustainable Rural Housing Guidelines 2005 and county rural design guides:
- Simple rectangular plan form (max 2:1 length to width ratio); avoid complex L, T, or U-plan forms
- Pitched roofs at 35–45°; hipped roofs acceptable; avoid flat roofs on dwellings in rural settings
- No dormer windows to the front elevation; Velux rooflights to the rear or side are acceptable
- Traditional materials: dry or wet dash render (white, cream, off-white, light grey), natural stone where locally appropriate, natural slate or fibre cement slate roofing
- Avoid: red or brown brick, dark/charcoal render, curved or ornate features, double-height entrance porches, fake timber frame features, excessive glazing to front elevation
- Windows: vertically proportioned (taller than wide); regular pattern; painted timber or equivalent; avoid large picture windows on the main rural elevation
- Siting: avoid ridgeline or skyline positions; step building into the landform rather than raising on a platform; include native species planting to integrate the dwelling into the landscape
- Scale: single storey plus attic or two storey; avoid oversized dormer/attic conversions that create a three-storey visual impression

NEW BUILD URBAN:
Key requirements under the Urban Design Manual 2009 and city/county development plans:
- Active street frontage: main entrance, windows, and activity facing the public street
- Privacy distances: minimum 22m back-to-back in residential zones; minimum 11m to the side boundary
- Materials: brick preferred in Dublin, Cork city, Limerick, Kilkenny, and similar historic urban contexts; quality render acceptable in suburban settings; avoid cheap or reflective cladding
- Rooflines: consistent with or complementary to the established streetscape; pitched roofs in low-density suburbs; flat or shallow-pitch acceptable in higher-density urban infill
- Boundary treatment: low walls, railings, or soft landscaping to front; avoid solid block walls or closed timber fencing to the street frontage
- Overshadowing and overlooking: comply with 45° sunlight/daylight test; bay windows, Juliet balconies, and high-level windows managed carefully
- Car parking: integrated without dominating the street frontage; avoid large areas of hardstanding to the front
- Refuse and cycle storage: integrated into the design, not an afterthought

EXTENSIONS:
Key requirements:
- Subordinate to the existing dwelling: the extension should not visually dominate or overwhelm the original structure
- Materials: match or sympathetically complement the existing house in terms of colour, texture, and finish
- Roof form: pitch and material of the extension should match the existing house where possible; single-storey flat-roof rear extensions are generally accepted
- Scale: rear extensions should not reduce the remaining garden to less than 25 sqm; should not cover more than half the original rear garden
- Window and door proportions: consistent with the existing house; avoid introducing a completely different design language
- Side extensions: maintain side passage of at least 1 metre; must not project forward of the front building line
- Overlooking and privacy: high-level or roof windows to minimise overlooking of adjacent properties

CHANGE OF APPEARANCE:
Key requirements:
- Any change should be consistent with or improve the character of the existing building and the streetscape
- External wall insulation (ETICS): render finish colour and texture should match or complement the existing appearance; avoid covering original stone or brick in conservation areas
- Solar panels: flush with roof slope; avoid prominent placement on the main street-facing elevation where possible; should not project above the ridgeline
- Window replacements: maintain original proportions and opening sizes; avoid replacing traditional timber sash or casement windows with flush uPVC in older buildings or conservation areas; colour and sightline width matter
- Stone cladding: natural materials generally preferred; applied stone veneer raises concerns about authenticity, particularly in rural or traditional settings
- Painting: colour choices should be compatible with the local streetscape; bright or non-traditional colours may be resisted in ACAs or established residential areas

─── RESPONSE FORMAT ──────────────────────────────────────────────────────────

Respond with ONLY a valid JSON object — no markdown, no code blocks, just raw JSON:
{
  "alignmentLevel": "STRONG" | "MODERATE" | "CONCERNS",
  "overallAssessment": "2-3 sentences summarising how well the design aligns with Irish planning design guidance for this specific county and project type. Be direct and specific.",
  "positiveElements": ["2 to 5 concise bullet strings describing specific aspects of the design that align well with local planning design guidance"],
  "potentialConcerns": ["1 to 5 concise bullet strings describing specific design aspects likely to be questioned by the planning authority; use [] if no concerns"],
  "recommendations": ["2 to 5 concise, actionable bullet strings specifying design changes that would improve the likelihood of a positive planning outcome"],
  "countyNotes": "2-3 sentences specifically addressing this county's published design requirements and how they apply to this project and the image observed"
}

ALIGNMENT LEVELS:
- STRONG: The design appears well aligned with local guidance; only minor refinements needed
- MODERATE: The design is generally on the right track but has notable elements requiring attention
- CONCERNS: There are significant design issues that are likely to lead to planning objections or refusal`;

// ─── County design notes ───────────────────────────────────────────────────────

const COUNTY_DESIGN_NOTES: Partial<Record<string, string>> = {
  Dublin: `DUBLIN DESIGN CONTEXT: Dublin City Council's Development Plan sets detailed urban design standards including: active street frontages with windows and main entrances facing the public street; brick as the preferred material in the inner city and established suburbs; defined privacy distances (22m back-to-back minimum); strict application of the 45° sunlight/daylight test; height transitions when adjacent to lower-density housing; car parking integrated to avoid dominating the street scene. The Dublin City Architect's office reviews prominent or large-scale proposals. For rural fringe areas (Fingal, South Dublin, Dún Laoghaire-Rathdown councils), the specific Local Area Plan for the settlement applies and reflects suburban or peri-urban character.`,
  Kildare: `KILDARE DESIGN CONTEXT: Kildare County Council's Development Plan includes a detailed Rural Housing Design Guide. Key requirements: simple rectangular plan form; traditional materials only (white, cream, or off-white dry dash render; natural slate roofing; painted timber windows); avoid red brick, terracotta render, mock-Tudor, and ornate features; roof pitch 35–45°; no front dormers; site to minimise visual impact on the open Kildare landscape; native species planting to integrate the dwelling. Urban areas (Naas, Newbridge, Maynooth) have separate urban design standards in their Local Area Plans.`,
  Wicklow: `WICKLOW DESIGN CONTEXT: Wicklow County Council's Rural House Design Guide is one of the most detailed in Ireland, reflecting the county's high-quality landscape. Strict requirements: simple rectangular plan; grey or off-white dry dash render (white is acceptable; avoid cream or warm tones in upland areas); natural slate; no front dormers; no siting on ridgelines or prominent skyline positions; substantial native species planting required; visual impact assessment needed in AONB or SPNZ designated areas. The county is sensitive to suburban design elements (bay windows, ornate porches, double-height glazing) that are strongly resisted in rural settings.`,
  Cork: `CORK DESIGN CONTEXT: Cork County Council's Rural Design Guide applies across rural Cork. Requirements vary significantly by location: in the Cork metropolitan greenbelt (Macroom, Carrigaline, Midleton corridors), very high design standards are required due to development pressure; in rural West Cork, traditional long-house or farmyard cluster forms in white render with natural slate are the preferred vernacular; in coastal areas, designs must respect the seascape with low-profile forms and non-reflective materials. Cork City has separate urban design standards. Check the specific Local Area Plan for the settlement, as each sets different design thresholds.`,
  Donegal: `DONEGAL DESIGN CONTEXT: Donegal County Council publishes a Design Guide for Rural Housing rooted in traditional Donegal vernacular. Key requirements: long-house or cottage proportions — linear, low-rise plan form; white or off-white wet dash render (the defining traditional Donegal finish); blue-black natural slate roofing; vertically proportioned painted timber windows; no front dormers; low-profile design to respect coastal and upland landscapes; traditional farmyard groupings and cluster siting encouraged. Coastal Zone Management policies apply within 300m of the high water mark, significantly restricting siting and form in those areas.`,
  Clare: `CLARE DESIGN CONTEXT: Clare County Development Plan design policies encourage traditional building forms and materials. In Burren areas: natural limestone and local stone are encouraged; render in neutral, natural tones; designs should respect the unique open limestone pavement landscape by sitting low and avoiding prominent positions. In Atlantic coastal areas (Loop Head, Kilkee, Lahinch, Doolin): low-profile designs, materials that blend with the coastal landscape, avoidance of large glazed gable ends facing the sea. Inland Clare follows standard rural design guidance: traditional render, natural slate, simple forms.`,
  Galway: `GALWAY DESIGN CONTEXT: Galway County Development Plan includes detailed design guidance for rural housing. In Connemara and the west: traditional forms inspired by the Irish cottage; white or natural render; natural stone detailing encouraged; simple plans that respect the exposed Atlantic landscape; avoid large south-facing glazing that would be visually prominent against the Connemara hills. In Gaeltacht areas, design sensitivity to the distinctive built character of the Irish-speaking regions is a specific policy objective. Galway City Council has separate urban design standards with active frontage requirements and quality material specifications.`,
  Kerry: `KERRY DESIGN CONTEXT: Kerry County Council's design policies reflect the county's exceptional scenic landscape. Key requirements: simple traditional rectangular forms; materials appropriate to the specific landscape character (coastal, mountain, or agricultural farmland); natural slate; render in natural tones (cream, off-white, lime white); avoidance of ridgeline or prominent elevated positions; significant landscape planting with native species; visual impact assessments required in the Ring of Kerry, Dingle Peninsula, and other scenic designations. Coastal areas face particularly stringent design scrutiny; any proposal in an AONB requires a Landscape and Visual Impact Assessment.`,
  Limerick: `LIMERICK DESIGN CONTEXT: Limerick City and County Council applies location-specific design standards. In the city and suburbs: urban design standards with active frontages, brick preferred in the city centre (consistent with Limerick's Georgian streetscapes), quality render in suburbs, strict privacy distance compliance. In rural County Limerick: traditional vernacular forms, white or cream render, natural slate, simple rectangular plans. The Ballyhoura Mountains, the Shannon corridor, and the agricultural heartland each have distinct landscape characters and the design response should reflect the specific local context.`,
  Sligo: `SLIGO DESIGN CONTEXT: Sligo County Council's design policies reference the county's distinctive landscape — Benbulben, Knocknarea, and the Atlantic coastline. Designs must respond sensitively to the dramatic topography: natural materials (local limestone in Benbulben area); simple traditional forms that do not compete with dramatic skylines; render in neutral tones; native species planting for landscape integration. The Benbulben face and surrounding uplands, and the Atlantic coastal areas, face strict visual impact requirements. Sligo Town and larger settlements have urban design standards in their Local Area Plans.`,
  Tipperary: `TIPPERARY DESIGN CONTEXT: Tipperary County Council's design policies reflect a traditional rural county with varied landscape. Traditional materials (white or cream render, natural slate) are expected throughout rural Tipperary. Simple rectangular or modest L-plan forms are preferred; avoid oversized or complex roof forms. Designs in the Galtee Mountains, Knockmealdowns, or the Slievenamon area face heightened landscape sensitivity standards and must demonstrate visual integration. Urban Clonmel, Nenagh, and Thurles have urban design standards in their Local Area Plans.`,
  Waterford: `WATERFORD DESIGN CONTEXT: Waterford City and County Council applies location-specific standards. In Waterford City's historic core: conservation area requirements — materials and forms consistent with the Viking and medieval city character; proposals near the historic waterfront face additional scrutiny. In suburban Waterford: quality urban design with active frontages. In rural Waterford: traditional vernacular forms with white or cream render and natural slate. The Comeragh Mountains and Copper Coast (UNESCO Global Geopark) are designated landscapes requiring sensitive, low-profile designs.`,
  Wexford: `WEXFORD DESIGN CONTEXT: Wexford County Council's design policies reflect a rural county with significant coastal and heritage landscape. Traditional materials (white or off-white render, natural slate) are expected in rural areas. Coastal areas (Wexford Harbour, the Hook Peninsula, Curracloe, the Saltee Islands viewshed) face landscape sensitivity requirements for visually prominent proposals. The historic towns of Wexford, Enniscorthy, and New Ross have urban design standards and conservation area designations in their Local Area Plans.`,
  Mayo: `MAYO DESIGN CONTEXT: Mayo County Council's design policies reflect a rural county with spectacular Atlantic and inland landscapes. Traditional materials (white render, natural slate, natural stone in areas where it is the local vernacular) are strongly preferred throughout. Designs on or near Achill Island, the Clew Bay coastline, the Erris Peninsula, and along the Wild Atlantic Way face strict landscape sensitivity requirements — low-profile forms, materials that blend with the landscape, and avoidance of prominent elevated positions are all key requirements. Simple traditional rectangular cottage-inspired forms are expected county-wide.`,
  Meath: `MEATH DESIGN CONTEXT: Meath County Council's design policies reflect a county under significant Dublin commuter pressure while retaining a strong rural character. Rural housing design must use traditional rectangular forms; white or cream render; natural slate; avoid suburban estate-style features (bay windows, decorative gable features, suburban boundary walls). The Brú na Bóinne World Heritage Site and its buffer zone have particular heritage sensitivity — any proposal visible from or adjacent to the World Heritage Site requires a heritage impact assessment. Urban Navan, Trim, and Kells have urban design standards.`,
  Louth: `LOUTH DESIGN CONTEXT: Louth County Council's design policies apply to Ireland's smallest county. Urban areas (Drogheda, Dundalk, Ardee) have urban design standards — active frontages, brick or quality render materials consistent with each town's character. Rural Louth requires traditional simple forms and materials. The setting of Brú na Bóinne World Heritage Site extends into south Louth, creating landscape sensitivity requirements for visually prominent proposals in that area.`,
  Monaghan: `MONAGHAN DESIGN CONTEXT: Monaghan County Council's design policies reflect a rural border county with a distinctive drumlin landscape. Traditional materials (white or cream render, natural slate) are expected throughout. The distinctive undulating drumlin landscape creates specific siting guidance: building into the drumlin's slope is preferred over siting on top; native species planting is expected to integrate the dwelling. Simple rectangular plans are preferred; suburban estate-style features are resisted in rural settings.`,
  Cavan: `CAVAN DESIGN CONTEXT: Cavan County Council's design policies reflect a rural lake county. Traditional materials (white or cream render, natural slate) are expected. Lakeside locations (Lough Sheelin, Lough Gowna, Lough Oughter) require additional sensitivity to visual and water quality impacts. Simple traditional forms — rectangular plan, pitched roof, traditional materials — are preferred throughout. The broader approach is generally supportive of rural housing with appropriate design.`,
  Leitrim: `LEITRIM DESIGN CONTEXT: Leitrim County Council's design policies reflect one of Ireland's most rural counties. Traditional materials (white or cream render, natural slate, local stone in upland areas) are expected. The Sliabh an Iarainn and Lough Allen upland areas have landscape sensitivity requirements for prominent proposals. Simple traditional cottage-inspired forms are strongly preferred. Leitrim is broadly supportive of rural housing and design guidance is applied with pragmatism, but traditional materials and proportions remain the baseline expectation.`,
  Roscommon: `ROSCOMMON DESIGN CONTEXT: Roscommon County Council's design policies reflect a rural midlands county. Traditional materials (white or cream render, natural slate) are expected throughout. Simple rectangular plans with pitched roofs are preferred. The Roscommon Lake District, the Suck Valley, and the Shannon corridor have additional landscape and ecological sensitivity requirements for proposals in visually prominent or waterside locations.`,
  Longford: `LONGFORD DESIGN CONTEXT: Longford County Council's design policies reflect a rural midlands county. Traditional materials (white or cream render, natural slate) are expected. Simple traditional forms are preferred throughout. The Royal Canal, Lough Ree shoreline, and River Shannon corridor have additional landscape sensitivity requirements.`,
  Offaly: `OFFALY DESIGN CONTEXT: Offaly County Council's design policies reflect a midlands county with diverse landscape. Traditional materials (white or cream render, natural slate) are expected in rural areas. Simple rectangular plans are preferred. The Slieve Bloom Mountains AONB designation requires sensitive design for proposals in visually prominent upland positions. The River Shannon and Grand Canal corridors have heritage and landscape sensitivity requirements.`,
  Laois: `LAOIS DESIGN CONTEXT: Laois County Council's design policies reflect a midlands county. Traditional materials (white or cream render, natural slate) are expected in rural areas. Simple rectangular plans are preferred. The Slieve Bloom Mountains AONB designation applies to upland areas. Portlaoise and other urban centres have urban design standards in their Local Area Plans.`,
  Westmeath: `WESTMEATH DESIGN CONTEXT: Westmeath County Council's design policies reflect a midlands lake county. Traditional materials (white or cream render, natural slate) are expected. Lough Ree, Lough Derravaragh, Lough Owel, and other lakeshores have additional landscape sensitivity requirements — proposals in visually prominent lakeshore positions must demonstrate careful siting and landscape integration. Athlone has urban design standards.`,
  Carlow: `CARLOW DESIGN CONTEXT: Carlow County Council's design policies reflect a small rural county. Traditional materials (white or cream render, natural slate) are expected in rural areas. Simple rectangular plans are preferred. The Barrow Valley (candidate UNESCO Geopark) has landscape sensitivity requirements. Carlow Town has urban design standards including active frontage requirements.`,
  Kilkenny: `KILKENNY DESIGN CONTEXT: Kilkenny County Council's design policies include guidance appropriate to an architecturally rich county. Kilkenny City has significant heritage and conservation requirements — Kilkenny limestone/blue limestone, natural stone, and materials consistent with the medieval city character are expected in sensitive areas; the city's architectural conservation area designation requires detailed design justification. Rural Kilkenny requires traditional forms and materials. The River Barrow and River Nore valleys are designated landscape areas with additional sensitivity requirements.`,
};

// ─── Build user message ────────────────────────────────────────────────────────

function buildUserMessage(county: string, projectType: string): string {
  const projectLabels: Record<string, string> = {
    "new-build-rural": "New Build — Rural Dwelling",
    "new-build-urban": "New Build — Urban/Suburban Dwelling",
    "extension": "Extension or Alteration to Existing Dwelling",
    "change-of-appearance": "Change of Appearance / External Works",
  };

  const countyNote = COUNTY_DESIGN_NOTES[county] ?? `This is in ${county} County. Apply standard Irish rural or urban design guidance appropriate to the project type and the general design character of ${county}.`;

  return `Please assess this image as a planning design review for an Irish planning application.

County: ${county}
Project Type: ${projectLabels[projectType] ?? projectType}

${countyNote}

Review the uploaded image against Irish planning design guidance for this county and project type. Identify what works well, what may raise planning concerns, and provide specific recommendations to improve the design's planning prospects.`;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isPaid) return paymentRequired();


  try {
    const contentType = request.headers.get("content-type") ?? "";

    let county: string;
    let projectType: string;
    let imageSource: Anthropic.Base64ImageSource | Anthropic.URLImageSource;

    if (contentType.includes("multipart/form-data")) {
      // ── File upload path ───────────────────────────────────────────────────
      const formData = await request.formData();
      county = (formData.get("county") as string | null) ?? "";
      projectType = (formData.get("projectType") as string | null) ?? "";
      const file = formData.get("image") as File | null;

      if (!county || !projectType) {
        return badRequest("County and project type are required.");
      }
      if (!file) {
        return badRequest("An image file is required.");
      }
      if (!ALLOWED_TYPES.has(file.type)) {
        return badRequest("Unsupported image type. Please upload a JPEG, PNG, WebP, or GIF.");
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return badRequest("Image file is too large. Maximum size is 4 MB.");
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      // Normalise jpg → jpeg for Anthropic SDK
      const mediaType = (file.type === "image/jpg" ? "image/jpeg" : file.type) as AllowedMediaType;

      imageSource = { type: "base64", media_type: mediaType, data: base64 };

    } else {
      // ── URL path ───────────────────────────────────────────────────────────
      const body = await request.json() as { county?: string; projectType?: string; imageUrl?: string };
      county = body.county ?? "";
      projectType = body.projectType ?? "";
      const imageUrl = body.imageUrl ?? "";

      if (!county || !projectType) {
        return badRequest("County and project type are required.");
      }
      if (!imageUrl) {
        return badRequest("An image URL is required.");
      }

      // Basic URL safety: must be http/https, not a private address
      let parsed: URL;
      try { parsed = new URL(imageUrl); } catch {
        return badRequest("Image URL is not a valid URL.");
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return badRequest("Image URL must use http or https.");
      }
      const host = parsed.hostname.toLowerCase();
      if (host === "localhost" || /^127\.|^10\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^192\.168\./.test(host)) {
        return badRequest("Image URL must be a publicly accessible URL.");
      }

      imageSource = { type: "url", url: imageUrl };
    }

    // ── Validate county and project type ──────────────────────────────────────
    const countyErr = validateCounty(county);
    if (countyErr) return badRequest(countyErr);

    if (!VALID_PROJECT_TYPES.has(projectType)) {
      return badRequest("Invalid project type.");
    }

    // ── Security scan on text inputs ──────────────────────────────────────────
    const securityErr = scanFields(county, projectType);
    if (securityErr) return badRequest(securityErr);

    // ── Call Claude with vision ───────────────────────────────────────────────
    const userMessage = buildUserMessage(county, projectType);

    // Race the Anthropic call against a 55-second timeout so the function never hangs
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Analysis timed out — please try again.")), 55_000)
    );

    const message = await Promise.race([
      client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: DESIGN_CHECK_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: imageSource },
              { type: "text", text: userMessage },
            ],
          },
        ],
      }),
      timeoutPromise,
    ]);

    const rawText = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    if (!rawText) {
      console.error("design-check: empty response from Claude");
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    let result: DesignCheckResult;
    try {
      result = JSON.parse(rawText);
    } catch {
      // Strip any markdown code fences Claude may have added despite instructions
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      try {
        result = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error("design-check: JSON parse failed. Raw text:", rawText, "Error:", parseErr);
        return NextResponse.json(
          { error: "The AI response could not be parsed. Please try again." },
          { status: 500 }
        );
      }
    }

    // Validate required fields are present
    if (!result.alignmentLevel || !result.overallAssessment) {
      console.error("design-check: incomplete result structure:", result);
      return NextResponse.json(
        { error: "The AI returned an incomplete response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("design-check error:", error);
    return NextResponse.json(
      { error: "Failed to analyse your image. Please try again." },
      { status: 500 }
    );
  }
}
