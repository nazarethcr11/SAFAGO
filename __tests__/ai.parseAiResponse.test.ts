import { describe, it, expect } from 'vitest';
import { parseAiResponse } from '@/lib/ai/parseAiResponse';
import { createInitialState } from '@/lib/conversationalEngine';
import type { ConversationState, Destination } from '@/types';

const baseState: ConversationState = createInitialState();

// ── Helper: build a minimal valid AI response JSON ───────────────────────────
function makeAiJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    nextStage: 'discovery',
    type: 'text',
    content: 'Hola, ¿a dónde quieres viajar?',
    recommendations: [],
    updatedPreferences: {
      region: null, climate: null, budget: null, mainActivity: null,
      travelStyle: null, luxuryLevel: null, interestTags: [],
      travelers: 1, month: null, tripDuration: null,
      originCity: null, originIata: null,
    },
    confirmedDestination: null,
    departureDate: null,
    returnDate: null,
    tripType: 2,
    shouldSearchFlights: false,
    ...overrides,
  });
}

// ── A full destination object for shortlist tests ─────────────────────────────
const BALI_DEST: Destination = {
  id: 'asia-bali', iata: 'DPS', name: 'Bali', country: 'Indonesia',
  climate: 'Tropical', estimatedPrice: 950, currency: 'USD',
  tags: ['Playa', 'Templos'], imageUrl: 'https://images.unsplash.com/bali.jpg',
  description: 'La isla de los dioses.', rating: 4.9,
};

// ─────────────────────────────────────────────────────────────────────────────
describe('parseAiResponse — JSON parsing', () => {
  it('parsea JSON limpio correctamente', () => {
    const result = parseAiResponse(makeAiJson(), baseState, 'hola');
    expect(result.content).toBe('Hola, ¿a dónde quieres viajar?');
    expect(result.type).toBe('text');
  });

  it('elimina bloques ```json y parsea el contenido', () => {
    const raw = '```json\n' + makeAiJson({ content: 'desde markdown' }) + '\n```';
    const result = parseAiResponse(raw, baseState, 'hola');
    expect(result.content).toBe('desde markdown');
  });

  it('elimina prefijo "json{..." sin backticks (formato real del LLM)', () => {
    const raw = 'json' + makeAiJson({ content: 'sin backticks' });
    const result = parseAiResponse(raw, baseState, 'hola');
    expect(result.content).toBe('sin backticks');
  });

  it('devuelve respuesta de error cuando el JSON es inválido', () => {
    const result = parseAiResponse('esto no es json {{{', baseState, 'hola');
    expect(result.type).toBe('text');
    expect(result.content).toContain('Lo siento');
    expect(result.shouldSearchFlights).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('parseAiResponse — merge de preferencias', () => {
  it('preserva la región ya detectada cuando la IA devuelve null en region', () => {
    const state: ConversationState = {
      ...baseState,
      preferences: { ...baseState.preferences, region: 'asia' },
    };
    const raw = makeAiJson({
      updatedPreferences: { region: null, climate: null },
    });
    const result = parseAiResponse(raw, state, 'quiero playa');
    expect(result.conversationState.preferences.region).toBe('asia');
  });

  it('actualiza la región cuando la IA proporciona un valor nuevo', () => {
    const raw = makeAiJson({
      updatedPreferences: { region: 'europe' },
    });
    const result = parseAiResponse(raw, baseState, 'quiero Europa');
    expect(result.conversationState.preferences.region).toBe('europe');
  });

  it('preserva el presupuesto previo cuando la IA no lo actualiza', () => {
    const state: ConversationState = {
      ...baseState,
      preferences: { ...baseState.preferences, budget: 1200 },
    };
    const raw = makeAiJson({ updatedPreferences: { budget: null } });
    const result = parseAiResponse(raw, state, 'ok');
    expect(result.conversationState.preferences.budget).toBe(1200);
  });

  it('acumula interestTags: usa los nuevos si hay, mantiene existentes si no', () => {
    const state: ConversationState = {
      ...baseState,
      preferences: { ...baseState.preferences, interestTags: ['surf'] },
    };
    // AI devuelve tags nuevos → reemplaza
    const raw = makeAiJson({
      updatedPreferences: { interestTags: ['gastronomia', 'fotografía'] },
    });
    const result = parseAiResponse(raw, state, 'me gusta la gastronomía');
    expect(result.conversationState.preferences.interestTags).toContain('gastronomia');
  });

  it('conserva interestTags existentes cuando la IA devuelve array vacío', () => {
    const state: ConversationState = {
      ...baseState,
      preferences: { ...baseState.preferences, interestTags: ['surf'] },
    };
    const raw = makeAiJson({ updatedPreferences: { interestTags: [] } });
    const result = parseAiResponse(raw, state, 'ok');
    expect(result.conversationState.preferences.interestTags).toContain('surf');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('parseAiResponse — fallback de keywords del mensaje', () => {
  it('detecta región "asia" desde el mensaje cuando la IA no la reporta', () => {
    const raw = makeAiJson({ updatedPreferences: { region: null } });
    const result = parseAiResponse(raw, baseState, 'quiero ir a Bali');
    expect(result.conversationState.preferences.region).toBe('asia');
  });

  it('detecta región "europe" desde el mensaje', () => {
    const raw = makeAiJson({ updatedPreferences: { region: null } });
    const result = parseAiResponse(raw, baseState, 'me llama París o Barcelona');
    expect(result.conversationState.preferences.region).toBe('europe');
  });

  it('detecta clima "cold" desde el mensaje', () => {
    const raw = makeAiJson({ updatedPreferences: { climate: null } });
    const result = parseAiResponse(raw, baseState, 'me encanta el ski y la nieve');
    expect(result.conversationState.preferences.climate).toBe('cold');
  });

  it('detecta actividad "beach" desde el mensaje', () => {
    const raw = makeAiJson({ updatedPreferences: { mainActivity: null } });
    const result = parseAiResponse(raw, baseState, 'quiero playa y arena');
    expect(result.conversationState.preferences.mainActivity).toBe('beach');
  });

  it('no sobreescribe región ya conocida con el fallback del mensaje', () => {
    const state: ConversationState = {
      ...baseState,
      preferences: { ...baseState.preferences, region: 'europe' },
    };
    // Mensaje menciona Bali pero región ya está fijada como europe
    const raw = makeAiJson({ updatedPreferences: { region: null } });
    const result = parseAiResponse(raw, state, 'cuéntame sobre Bali');
    expect(result.conversationState.preferences.region).toBe('europe');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('parseAiResponse — confirmedDestination', () => {
  it('enriquece confirmedDestination con el objeto completo del shortlist (por iata)', () => {
    const state: ConversationState = {
      ...baseState,
      shortlistedDestinations: [BALI_DEST],
    };
    const raw = makeAiJson({
      confirmedDestination: { name: 'Bali', iata: 'DPS' },
    });
    const result = parseAiResponse(raw, state, 'quiero ir a Bali');
    expect(result.conversationState.confirmedDestination?.imageUrl).toBe(BALI_DEST.imageUrl);
    expect(result.conversationState.confirmedDestination?.tags).toEqual(BALI_DEST.tags);
    expect(result.conversationState.confirmedDestination?.estimatedPrice).toBe(950);
  });

  it('enriquece confirmedDestination por nombre cuando no hay iata', () => {
    const state: ConversationState = {
      ...baseState,
      shortlistedDestinations: [BALI_DEST],
    };
    const raw = makeAiJson({
      confirmedDestination: { name: 'Bali', iata: null },
    });
    const result = parseAiResponse(raw, state, 'quiero Bali');
    expect(result.conversationState.confirmedDestination?.id).toBe('asia-bali');
  });

  it('crea objeto mínimo cuando el destino no está en el shortlist', () => {
    const raw = makeAiJson({
      confirmedDestination: { name: 'Dubrovnik', iata: 'DBV' },
    });
    const result = parseAiResponse(raw, baseState, 'quiero Dubrovnik');
    const dest = result.conversationState.confirmedDestination;
    expect(dest).not.toBeNull();
    expect(dest?.name).toBe('Dubrovnik');
    expect(dest?.iata).toBe('DBV');
    // imageUrl debe ser el fallback (no crashear DestinationCard)
    expect(dest?.imageUrl).toBeTruthy();
    expect(dest?.tags).toEqual([]);
  });

  it('extrae destinationIata desde confirmedDestination', () => {
    const raw = makeAiJson({
      confirmedDestination: { name: 'Bangkok', iata: 'BKK' },
    });
    const result = parseAiResponse(raw, baseState, 'Bangkok');
    expect(result.conversationState.destinationIata).toBe('BKK');
  });

  it('preserva el confirmedDestination previo cuando la IA no envía uno nuevo', () => {
    const state: ConversationState = {
      ...baseState,
      confirmedDestination: BALI_DEST,
      destinationIata: 'DPS',
    };
    const raw = makeAiJson({ confirmedDestination: null });
    const result = parseAiResponse(raw, state, 'ok, fechas: 10 de agosto');
    expect(result.conversationState.confirmedDestination?.name).toBe('Bali');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('parseAiResponse — tripType y shouldSearchFlights', () => {
  it('tripType por defecto es 2 (solo ida)', () => {
    const result = parseAiResponse(makeAiJson(), baseState, 'ok');
    expect(result.conversationState.tripType).toBe(2);
  });

  it('tripType 1 cuando la IA lo indica', () => {
    const raw = makeAiJson({ tripType: 1, returnDate: '2026-08-20' });
    const result = parseAiResponse(raw, baseState, 'ida y vuelta');
    expect(result.conversationState.tripType).toBe(1);
    expect(result.conversationState.returnDate).toBe('2026-08-20');
  });

  it('shouldSearchFlights false por defecto', () => {
    const result = parseAiResponse(makeAiJson(), baseState, 'ok');
    expect(result.shouldSearchFlights).toBe(false);
  });

  it('shouldSearchFlights true cuando la IA lo indica', () => {
    const raw = makeAiJson({ shouldSearchFlights: true });
    const result = parseAiResponse(raw, baseState, 'busca vuelos');
    expect(result.shouldSearchFlights).toBe(true);
  });

  it('incrementa turnCount en +1', () => {
    const state = { ...baseState, turnCount: 4 };
    const result = parseAiResponse(makeAiJson(), state, 'ok');
    expect(result.conversationState.turnCount).toBe(5);
  });
});
