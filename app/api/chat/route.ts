import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ChatRequest, ChatResponse, ConversationState, ConversationPreferences } from '@/types';
import { getMockResponse } from '@/lib/mockResponses';
import { createInitialState } from '@/lib/conversationalEngine';

// ── N8N response normalizer ──────────────────────────────────────────────────
// N8N may return preferences in various shapes (old or new model).
// This ensures the frontend always receives a clean ConversationState.
function normalizeN8NResponse(data: Record<string, unknown>, fallbackState: ConversationState): ChatResponse {
  const rawState = (data.conversationState ?? {}) as Record<string, unknown>;
  const rawPrefs = (rawState.preferences ?? {}) as Record<string, unknown>;

  // Build preferences — accept both old format (activities[]/style) and new (region/mainActivity)
  const prefs: ConversationPreferences = {
    region:       (rawPrefs.region       as string | null) ?? null,
    climate:      (rawPrefs.climate      as string | null) ?? null,
    budget:       (rawPrefs.budget       as number | null) ?? null,
    mainActivity: (rawPrefs.mainActivity as string | null) ?? null,
    travelStyle:  (rawPrefs.travelStyle  as string | null) ?? null,
    luxuryLevel:  (rawPrefs.luxuryLevel  as string | null) ?? null,
    interestTags: (rawPrefs.interestTags as string[]) ?? [],
    travelers:    (rawPrefs.travelers    as number) ?? 1,
    month:        (rawPrefs.month        as string | null) ?? null,
    tripDuration: (rawPrefs.tripDuration as string | null) ?? null,
    originCity:   (rawPrefs.originCity   as string | null) ?? null,
    originIata:   (rawPrefs.originIata   as string | null) ?? null,
  };

  const state: ConversationState = {
    stage:                    (rawState.stage as ConversationState['stage']) ?? fallbackState.stage,
    preferences:              prefs,
    shortlistedDestinations:  (rawState.shortlistedDestinations  as ConversationState['shortlistedDestinations'])  ?? fallbackState.shortlistedDestinations,
    rejectedDestinationIds:   (rawState.rejectedDestinationIds   as string[])  ?? fallbackState.rejectedDestinationIds,
    confirmedDestination:     (rawState.confirmedDestination as ConversationState['confirmedDestination']) ?? null,
    departureDate:            (rawState.departureDate  as string | null) ?? null,
    returnDate:               (rawState.returnDate     as string | null) ?? null,
    turnCount:                (rawState.turnCount      as number) ?? fallbackState.turnCount,
  };

  return {
    type:            (data.type as ChatResponse['type']) ?? 'text',
    content:         (data.content as string) ?? '',
    recommendations: (data.recommendations as ChatResponse['recommendations']) ?? [],
    flights:         (data.flights         as ChatResponse['flights'])         ?? [],
    conversationState: state,
  };
}

export async function POST(request: NextRequest) {
  let body: ChatRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ type: 'error', content: 'Solicitud inválida' }, { status: 400 });
  }

  const { message, sessionId, conversationState } = body;

  if (!message?.trim()) {
    return NextResponse.json({ type: 'error', content: 'Mensaje requerido' }, { status: 400 });
  }

  const state = conversationState ?? createInitialState();
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  // Dev mode: use in-process conversational engine
  if (!webhookUrl) {
    const { response, newState } = await getMockResponse(message, state);
    return NextResponse.json({ ...response, conversationState: newState });
  }

  try {
    const { data } = await axios.post<Record<string, unknown>>(
      webhookUrl,
      { message, sessionId, conversationState: state },
      { timeout: 30000, headers: { 'Content-Type': 'application/json' } }
    );
    return NextResponse.json(normalizeN8NResponse(data, state));
  } catch (error) {
    console.error('[SAFAGO] N8N Webhook error:', error);

    // Fallback to mock engine if N8N fails
    const { response, newState } = await getMockResponse(message, state);
    return NextResponse.json({ ...response, conversationState: newState });
  }
}
