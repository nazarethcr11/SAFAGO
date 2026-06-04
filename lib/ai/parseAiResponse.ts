import { ConversationState, ConversationPreferences, Destination } from '@/types';
import { resolveImageUrl } from './imageResolver';

export interface ParsedAiResult {
  type: string;
  content: string;
  recommendations: Destination[];
  shouldSearchFlights: boolean;
  conversationState: ConversationState;
}

// ── Region / climate / activity fallback keywords ────────────────────────────
// Mirrors the inline detection in "Parse Conversation Response" (v3).

const REGION_PATTERNS: Array<[RegExp, string]> = [
  [/\basia\b|tailandia|thailand|bali|japon|japan|vietnam|maldivas|filipinas|camboya|singapur|nepal|sri lanka|dubai|india|turquia|corea/i, 'asia'],
  [/\beuropa\b|paris|madrid|barcelona|roma|santorini|lisboa|amsterdam|praga|islandia|suiza|viena|berlin/i, 'europe'],
  [/cancun|punta cana|caribe|tulum|cuba|jamaica/i, 'caribbean'],
  [/sudamerica|peru|argentina|colombia|chile|brasil|ecuador|machu picchu|bariloche/i, 'south_america'],
  [/costa rica|centroamerica|panama|guatemala/i, 'central_america'],
  [/africa|marruecos|marrakech|tanzania|serengeti|kenya|egipto/i, 'africa'],
];

const CLIMATE_PATTERNS: Array<[RegExp, string]> = [
  [/calido|tropical|calor|playa|sol|warm/i, 'warm'],
  [/frio|nieve|ski|esqui|cold|invierno/i, 'cold'],
  [/templado|temperate|primavera/i, 'temperate'],
];

const ACTIVITY_PATTERNS: Array<[RegExp, string]> = [
  [/ski|esqui|nieve|snowboard/i, 'skiing'],
  [/playa|beach|arena/i, 'beach'],
  [/buceo|diving|snorkel/i, 'diving'],
  [/trekking|senderismo|hiking/i, 'trekking'],
  [/safari|wildlife/i, 'wildlife'],
  [/cultura|museos|historia/i, 'culture'],
  [/bienestar|wellness|yoga|spa/i, 'wellness'],
];

function detectFromMessage(msg: string, patterns: Array<[RegExp, string]>): string | null {
  for (const [re, value] of patterns) {
    if (re.test(msg)) return value;
  }
  return null;
}

// ── confirmedDestination enrichment ──────────────────────────────────────────
// The AI returns { name, iata } (minimal). We try to find the full Destination
// object in shortlistedDestinations so DestinationCard renders correctly.

function enrichConfirmedDestination(
  aiConfirmed: { name?: string; iata?: string } | null,
  shortlisted: Destination[],
  previousConfirmed: Destination | null
): Destination | null {
  if (!aiConfirmed) return previousConfirmed;

  // Try to match by IATA first, then by name (case-insensitive)
  const found = shortlisted.find(
    (d) =>
      (aiConfirmed.iata && d.iata === aiConfirmed.iata) ||
      (aiConfirmed.name &&
        d.name.toLowerCase() === aiConfirmed.name.toLowerCase())
  );
  if (found) return found;

  // If not found in shortlist (e.g., user named a specific destination from
  // the start), build a minimal Destination so the card doesn't crash.
  if (!aiConfirmed.name) return previousConfirmed;

  return {
    id: (aiConfirmed.iata ?? aiConfirmed.name).toLowerCase().replace(/[^a-z0-9]/g, '-'),
    iata: aiConfirmed.iata,
    name: aiConfirmed.name,
    country: '',
    climate: '',
    estimatedPrice: 0,
    currency: 'USD',
    tags: [],
    imageUrl: resolveImageUrl({ name: aiConfirmed.name, iata: aiConfirmed.iata }),
    description: '',
  };
}

// ── Main parser ───────────────────────────────────────────────────────────────

/**
 * Parses the raw LLM text, merges preferences, and builds the new
 * ConversationState. Mirrors "Parse Conversation Response" from v3.
 *
 * @param rawText    Raw string returned by OpenAI
 * @param incoming   Current ConversationState (before this turn)
 * @param userMsg    The user's message (for keyword fallback detection)
 */
export function parseAiResponse(
  rawText: string,
  incoming: ConversationState,
  userMsg: string
): ParsedAiResult {
  const incomingPrefs = incoming.preferences ?? {};
  const fallbackResult: ParsedAiResult = {
    type: 'text',
    content: 'Lo siento, tuve un error. ¿Puedes repetirme qué tipo de viaje buscas?',
    recommendations: [],
    shouldSearchFlights: false,
    conversationState: incoming,
  };

  // ── 1. Clean and parse the JSON ───────────────────────────────────────────
  let parsed: Record<string, unknown>;
  try {
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^json\s*/i, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return fallbackResult;
  }

  // ── 2. Merge preferences (accumulative — never overwrite with null) ────────
  const newPrefs = (parsed.updatedPreferences ?? {}) as Partial<ConversationPreferences> & { tripType?: number };

  const mergedPrefs: ConversationPreferences = {
    region:       newPrefs.region       ?? incomingPrefs.region       ?? null,
    climate:      newPrefs.climate      ?? incomingPrefs.climate      ?? null,
    budget:       newPrefs.budget       ?? incomingPrefs.budget       ?? null,
    mainActivity: newPrefs.mainActivity ?? incomingPrefs.mainActivity ?? null,
    travelStyle:  newPrefs.travelStyle  ?? incomingPrefs.travelStyle  ?? null,
    luxuryLevel:  newPrefs.luxuryLevel  ?? incomingPrefs.luxuryLevel  ?? null,
    interestTags: (newPrefs.interestTags as string[] | undefined)?.length
      ? (newPrefs.interestTags as string[])
      : (incomingPrefs.interestTags ?? []),
    travelers:    newPrefs.travelers    ?? incomingPrefs.travelers    ?? 1,
    month:        newPrefs.month        ?? incomingPrefs.month        ?? null,
    tripDuration: newPrefs.tripDuration ?? incomingPrefs.tripDuration ?? null,
    originCity:   newPrefs.originCity   ?? incomingPrefs.originCity   ?? null,
    originIata:   newPrefs.originIata   ?? incomingPrefs.originIata   ?? null,
  };

  // ── 3. Keyword fallback (from user message) if AI missed it ───────────────
  const lowerMsg = userMsg.toLowerCase();
  if (!mergedPrefs.region)       mergedPrefs.region       = detectFromMessage(lowerMsg, REGION_PATTERNS);
  if (!mergedPrefs.climate)      mergedPrefs.climate      = detectFromMessage(lowerMsg, CLIMATE_PATTERNS);
  if (!mergedPrefs.mainActivity) mergedPrefs.mainActivity = detectFromMessage(lowerMsg, ACTIVITY_PATTERNS);

  // ── 4. Extract AI-level fields ────────────────────────────────────────────
  const aiConfirmedRaw = parsed.confirmedDestination as { name?: string; iata?: string } | null | undefined;
  const tripType = (parsed.tripType as number | undefined) ?? (incoming.tripType ?? 2);

  // ── 5. Build shortlistedDestinations (kept if AI sent none) ──────────────
  const rawRecs = (parsed.recommendations as Destination[] | undefined) ?? [];
  const shortlisted = rawRecs.length > 0 ? rawRecs : (incoming.shortlistedDestinations ?? []);

  // ── 6. Enrich confirmedDestination to full Destination object ─────────────
  const confirmedDestination = enrichConfirmedDestination(
    aiConfirmedRaw ?? null,
    shortlisted,
    incoming.confirmedDestination
  );

  const destinationIata =
    confirmedDestination?.iata ??
    (aiConfirmedRaw?.iata) ??
    incoming.destinationIata ??
    undefined;

  // ── 7. Build new ConversationState ────────────────────────────────────────
  const newState: ConversationState = {
    stage: (parsed.nextStage as ConversationState['stage']) || incoming.stage || 'discovery',
    preferences: mergedPrefs,
    shortlistedDestinations: shortlisted,
    rejectedDestinationIds: incoming.rejectedDestinationIds ?? [],
    confirmedDestination,
    destinationIata,
    departureDate: (parsed.departureDate as string | null) ?? incoming.departureDate ?? null,
    tripType,
    returnDate:    (parsed.returnDate    as string | null) ?? incoming.returnDate    ?? null,
    turnCount: (incoming.turnCount ?? 0) + 1,
  };

  return {
    type: (parsed.type as string) || 'text',
    content: (parsed.content as string) || '',
    recommendations: rawRecs,
    shouldSearchFlights: parsed.shouldSearchFlights === true,
    conversationState: newState,
  };
}
