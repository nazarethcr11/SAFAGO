import OpenAI from 'openai';
import { ConversationState, ChatResponse, MessageHistoryItem } from '@/types';
import { buildSystemPrompt } from './systemPrompt';
import { parseAiResponse } from './parseAiResponse';
import { applyHardConstraintFilter } from './hardConstraintFilter';
import { searchFlights, FlightParamError } from './flightSearch';
import { getMockResponse } from '@/lib/mockResponses';

// Lazy-init OpenAI client (only instantiated when API key is present)
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ── OpenAI call ───────────────────────────────────────────────────────────────

async function callOpenAI(
  userMessage: string,
  state: ConversationState,
  history: MessageHistoryItem[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(state, new Date());

  // Build messages array: system + recent history + current user turn
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  return completion.choices[0]?.message?.content ?? '';
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

/**
 * Runs the full conversation pipeline, replacing the N8N workflow:
 *   1. Call GPT-4o-mini with system prompt + message history
 *   2. Parse AI response + merge preferences (parseAiResponse)
 *   3. Apply hard constraint filter on recommendations
 *   4. If shouldSearchFlights → call SerpAPI and process results
 *   5. Return ChatResponse
 *
 * Falls back to mock engine when OPENAI_API_KEY is not set.
 */
export async function runConversationPipeline(
  message: string,
  state: ConversationState,
  history: MessageHistoryItem[]
): Promise<ChatResponse> {
  // ── Fallback: no API key → use mock engine ────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    const { response, newState } = await getMockResponse(message, state);
    return { ...response, conversationState: newState };
  }

  try {
    // ── Step 1: call the LLM ─────────────────────────────────────────────────
    const rawText = await callOpenAI(message, state, history);

    // ── Step 2: parse + build new state ─────────────────────────────────────
    const parsed = parseAiResponse(rawText, state, message);

    // ── Step 3: hard constraint filter ──────────────────────────────────────
    const filtered = applyHardConstraintFilter(parsed);

    // ── Step 4: flight search (if needed) ───────────────────────────────────
    if (filtered.shouldSearchFlights) {
      try {
        const flightResult = await searchFlights(filtered.conversationState);
        return {
          type:               flightResult.type,
          content:            flightResult.content,
          flights:            flightResult.flights,
          recommendations:    flightResult.recommendations,
          conversationState:  flightResult.conversationState,
        };
      } catch (err) {
        if (err instanceof FlightParamError) {
          // Missing params — return a text response asking for missing info
          return {
            type: 'text',
            content: `Para buscar vuelos necesito: ${err.message}`,
            recommendations: filtered.recommendations,
            flights: [],
            conversationState: { ...filtered.conversationState, stage: 'date_selection' },
          };
        }
        // SerpAPI network / quota error
        console.error('[SAFAGO] SerpAPI error:', err);
        return {
          type: 'text',
          content: '😔 No pude conectarme al buscador de vuelos en este momento. ¿Quieres que lo intentemos de nuevo?',
          recommendations: filtered.recommendations,
          flights: [],
          conversationState: filtered.conversationState,
        };
      }
    }

    // ── Step 5: conversational response ─────────────────────────────────────
    return {
      type:              filtered.type as ChatResponse['type'],
      content:           filtered.content,
      recommendations:   filtered.recommendations,
      flights:           [],
      conversationState: filtered.conversationState,
    };

  } catch (err) {
    console.error('[SAFAGO] Pipeline error:', err);
    // Graceful degradation — fall back to mock engine so the chat stays alive
    const { response, newState } = await getMockResponse(message, state);
    return { ...response, conversationState: newState };
  }
}
