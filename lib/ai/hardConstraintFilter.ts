import { Destination } from '@/types';
import { ParsedAiResult } from './parseAiResponse';
import { resolveImageUrl } from './imageResolver';

// ── Country → region mapping ──────────────────────────────────────────────────
// Mirrors COUNTRY_REGION in "Hard Constraint Filter" (v3).

const COUNTRY_REGION: Record<string, string> = {
  indonesia: 'asia', tailandia: 'asia', thailand: 'asia', vietnam: 'asia',
  'sri lanka': 'asia', japon: 'asia', japan: 'asia', nepal: 'asia',
  singapur: 'asia', singapore: 'asia', maldivas: 'asia', maldives: 'asia',
  filipinas: 'asia', philippines: 'asia', camboya: 'asia', cambodia: 'asia',
  india: 'asia', china: 'asia', malasia: 'asia', malaysia: 'asia',
  myanmar: 'asia', laos: 'asia', mongolia: 'asia',
  'emiratos arabes unidos': 'asia', uae: 'asia', turquia: 'asia', turkey: 'asia',
  jordania: 'asia', 'hong kong': 'asia', taiwan: 'asia',

  francia: 'europe', france: 'europe', espana: 'europe', spain: 'europe',
  italia: 'europe', italy: 'europe', grecia: 'europe', greece: 'europe',
  portugal: 'europe', 'paises bajos': 'europe', netherlands: 'europe',
  'republica checa': 'europe', 'czech republic': 'europe',
  islandia: 'europe', iceland: 'europe', suiza: 'europe', switzerland: 'europe',
  austria: 'europe', croacia: 'europe', croatia: 'europe',
  alemania: 'europe', germany: 'europe', 'reino unido': 'europe', 'united kingdom': 'europe',

  peru: 'south_america', argentina: 'south_america', colombia: 'south_america',
  chile: 'south_america', brasil: 'south_america', brazil: 'south_america',
  ecuador: 'south_america',

  mexico: 'caribbean', méxico: 'caribbean', 'rep. dominicana': 'caribbean', cuba: 'caribbean', jamaica: 'caribbean',

  'costa rica': 'central_america', panama: 'central_america', guatemala: 'central_america',

  'estados unidos': 'north_america', usa: 'north_america', canada: 'north_america',

  marruecos: 'africa', morocco: 'africa', tanzania: 'africa',
  kenia: 'africa', kenya: 'africa', egipto: 'africa', egypt: 'africa',
  sudafrica: 'africa', 'south africa': 'africa',

  australia: 'oceania', 'nueva zelanda': 'oceania', 'new zealand': 'oceania',
};

// City/destination name → region overrides
const NAME_PATTERNS: Array<[RegExp, string]> = [
  [/dubai|abu dhabi|doha|riyadh|qatar/i, 'asia'],
  [/canc[uú]n|tulum|playa del carmen|riviera maya/i, 'caribbean'],
  [/paris|madrid|roma|barcelona|santorini|lisboa|amsterdam|praga|viena|zurich|berlin|oslo/i, 'europe'],
  [/bali|tokio|tokyo|bangkok|singapur|singapore|maldivas|filipinas|camboya|dubai/i, 'asia'],
  [/cusco|machu picchu|buenos aires|rio de janeiro|medellin|bogota/i, 'south_america'],
  [/nueva york|new york|las vegas|miami|chicago|toronto|vancouver/i, 'north_america'],
  [/marrakech|nairobi|zanzibar|serengeti|ciudad del cabo/i, 'africa'],
  [/sydney|melbourne|auckland|bora bora/i, 'oceania'],
];

const VALID_REGIONS = new Set([
  'asia', 'europe', 'south_america', 'caribbean',
  'central_america', 'north_america', 'africa', 'oceania',
]);

function resolveRegion(rec: Partial<Destination> & { region?: string }): string | null {
  // 1. Use the region field if present and valid
  if (rec.region) {
    const r = rec.region.toLowerCase().replace(/[\s-]/g, '_');
    if (VALID_REGIONS.has(r)) return r;
    if (r.includes('asia'))    return 'asia';
    if (r.includes('europ'))   return 'europe';
    if (r.includes('sud') || r.includes('south_am') || r.includes('latin')) return 'south_america';
    if (r.includes('carib') || r.includes('mexic')) return 'caribbean';
    if (r.includes('central')) return 'central_america';
    if (r.includes('north') || r.includes('norte')) return 'north_america';
    if (r.includes('afric'))   return 'africa';
    if (r.includes('ocean'))   return 'oceania';
  }

  // 2. Lookup by country name
  if (rec.country) {
    const c = rec.country.toLowerCase();
    if (COUNTRY_REGION[c]) return COUNTRY_REGION[c];
    for (const [k, v] of Object.entries(COUNTRY_REGION)) {
      if (c.includes(k) || k.includes(c)) return v;
    }
  }

  // 3. Lookup by destination name
  if (rec.name) {
    for (const [pattern, region] of NAME_PATTERNS) {
      if (pattern.test(rec.name)) return region;
    }
  }

  return null;
}

/**
 * Validates and normalises recommendations.
 * Mirrors "Hard Constraint Filter" from v3:
 *  - Guarantees required fields (id, currency, tags, imageUrl, estimatedPrice)
 *  - Removes recommendations that don't match the user's target region
 *    (only when the filtered set is non-empty — never empties the list
 *     if ALL recs have the wrong region; that signals the AI hallucinated
 *     everything, so we pass through and let the AI fix it next turn)
 */
export function applyHardConstraintFilter(data: ParsedAiResult): ParsedAiResult {
  const targetRegion = data.conversationState.preferences.region;

  // Normalise required fields
  let recs: (Destination & { region?: string })[] = data.recommendations.map((r) => ({
    ...r,
    id: r.id || r.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `dest-${Math.random().toString(36).slice(2)}`,
    currency: r.currency || 'USD',
    rating: r.rating ?? 4.5,
    tags: r.tags ?? [],
    imageUrl: resolveImageUrl(r),
    estimatedPrice: r.estimatedPrice || 800,
    description: r.description || '',
  }));

  // Filter by region only when a target region is known
  if (targetRegion && recs.length > 0) {
    const valid = recs.filter((r) => {
      const recRegion = resolveRegion(r);
      return !recRegion || recRegion === targetRegion;
    });
    // Only apply filter if it leaves at least one result
    if (valid.length > 0 && valid.length < recs.length) recs = valid;
    else if (valid.length === 0) recs = [];
  }

  // Fix imageUrl of confirmedDestination too (AI may have omitted or hallucinated it)
  const confirmedDest = data.conversationState.confirmedDestination;
  const fixedConfirmed = confirmedDest
    ? { ...confirmedDest, imageUrl: resolveImageUrl(confirmedDest) }
    : null;

  return {
    ...data,
    // If we ended up with destination recs, force type = 'destinations'
    type: recs.length > 0 ? 'destinations' : data.type,
    recommendations: recs,
    conversationState: {
      ...data.conversationState,
      confirmedDestination: fixedConfirmed,
    },
  };
}
