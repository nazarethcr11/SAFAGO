import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FlightParamError } from '@/lib/ai/flightSearch';
import { createInitialState } from '@/lib/conversationalEngine';
import type { ConversationState, Destination } from '@/types';

// ── Mock axios BEFORE importing flightSearch ──────────────────────────────────
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Import AFTER mock is registered
import axios from 'axios';
import { searchFlights } from '@/lib/ai/flightSearch';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BALI_DEST: Destination = {
  id: 'asia-bali', iata: 'DPS', name: 'Bali', country: 'Indonesia',
  climate: 'Tropical', estimatedPrice: 950, currency: 'USD',
  tags: ['Playa'], imageUrl: 'https://img.unsplash.com/bali.jpg', description: '',
};

function makeState(overrides: Partial<ConversationState> = {}): ConversationState {
  return {
    ...createInitialState(),
    confirmedDestination: BALI_DEST,
    destinationIata: 'DPS',
    departureDate: '2026-08-10',
    tripType: 2,
    preferences: {
      ...createInitialState().preferences,
      originIata: 'LIM',
      originCity: 'Lima',
      travelers: 1,
    },
    ...overrides,
  };
}

// ── Minimal SerpAPI response ───────────────────────────────────────────────────
const MOCK_SERP_RESPONSE = {
  search_parameters: { outbound_date: '2026-08-10', currency: 'USD' },
  search_metadata: { google_flights_url: 'https://www.google.com/travel/flights?tfs=VERIFIED' },
  best_flights: [
    {
      price: 850,
      total_duration: 810,
      airline_logo: 'https://logo.com/latam.png',
      flights: [
        {
          flight_number: 'LA540',
          airline: 'LATAM',
          airline_logo: 'https://logo.com/latam.png',
          departure_airport: { id: 'LIM', name: 'Jorge Chávez', time: '2026-08-10 23:00' },
          arrival_airport:   { id: 'DPS', name: 'Ngurah Rai',   time: '2026-08-12 10:00' },
          duration: 810,
          travel_class: 'Economy',
          overnight: true,
        },
      ],
      layovers: [],
    },
    {
      price: 1200,
      total_duration: 980,
      flights: [
        {
          flight_number: 'LA100',
          airline: 'LATAM',
          departure_airport: { id: 'LIM', name: 'Jorge Chávez', time: '2026-08-10 08:00' },
          arrival_airport:   { id: 'BOG', name: 'El Dorado',    time: '2026-08-10 10:30' },
          duration: 150,
          travel_class: 'Economy',
        },
        {
          flight_number: 'LA200',
          airline: 'LATAM',
          departure_airport: { id: 'BOG', name: 'El Dorado',    time: '2026-08-10 12:00' },
          arrival_airport:   { id: 'DPS', name: 'Ngurah Rai',   time: '2026-08-11 18:00' },
          duration: 830,
          travel_class: 'Economy',
        },
      ],
      layovers: [{ id: 'BOG', name: 'El Dorado', duration: 90, overnight: false }],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
describe('validateFlightParams', () => {
  it('lanza FlightParamError cuando falta confirmedDestination', async () => {
    const state = makeState({ confirmedDestination: null });
    await expect(searchFlights(state)).rejects.toBeInstanceOf(FlightParamError);
  });

  it('lanza FlightParamError cuando falta originIata', async () => {
    const state = makeState({
      preferences: { ...makeState().preferences, originIata: null },
    });
    await expect(searchFlights(state)).rejects.toBeInstanceOf(FlightParamError);
  });

  it('lanza FlightParamError cuando falta destinationIata', async () => {
    const state = makeState({ destinationIata: undefined });
    await expect(searchFlights(state)).rejects.toBeInstanceOf(FlightParamError);
  });

  it('lanza FlightParamError cuando falta departureDate', async () => {
    const state = makeState({ departureDate: null });
    await expect(searchFlights(state)).rejects.toBeInstanceOf(FlightParamError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('SerpAPI — construcción de parámetros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    // Provide SERPAPI_KEY for these tests
    process.env.SERPAPI_KEY = 'test-key-123';
  });

  it('NO envía return_date cuando tripType es 2 (solo ida)', async () => {
    const state = makeState({ tripType: 2, returnDate: null });
    await searchFlights(state);

    const callParams = vi.mocked(axios.get).mock.calls[0][1]?.params as Record<string, string>;
    expect(callParams.return_date).toBeUndefined();
    expect(callParams.type).toBe('2');
  });

  it('NO envía return_date cuando tripType es 2 aunque returnDate tenga valor', async () => {
    // Escenario imposible en uso normal pero validamos el guard
    const state = makeState({ tripType: 2, returnDate: '2026-08-20' });
    await searchFlights(state);

    const callParams = vi.mocked(axios.get).mock.calls[0][1]?.params as Record<string, string>;
    expect(callParams.return_date).toBeUndefined();
  });

  it('SÍ envía return_date cuando tripType es 1 (ida y vuelta)', async () => {
    const state = makeState({ tripType: 1, returnDate: '2026-08-20' });
    await searchFlights(state);

    const callParams = vi.mocked(axios.get).mock.calls[0][1]?.params as Record<string, string>;
    expect(callParams.return_date).toBe('2026-08-20');
    expect(callParams.type).toBe('1');
  });

  it('usa el arrival_id correcto (destinationIata)', async () => {
    const state = makeState({ destinationIata: 'DPS' });
    await searchFlights(state);

    const callParams = vi.mocked(axios.get).mock.calls[0][1]?.params as Record<string, string>;
    expect(callParams.arrival_id).toBe('DPS');
  });

  it('usa el departure_id del originIata', async () => {
    await searchFlights(makeState());

    const callParams = vi.mocked(axios.get).mock.calls[0][1]?.params as Record<string, string>;
    expect(callParams.departure_id).toBe('LIM');
  });

  it('incluye el api_key en los params', async () => {
    await searchFlights(makeState());

    const callParams = vi.mocked(axios.get).mock.calls[0][1]?.params as Record<string, string>;
    expect(callParams.api_key).toBe('test-key-123');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('processFlights — resultado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SERPAPI_KEY = 'test-key-123';
  });

  it('devuelve respuesta de texto cuando no hay vuelos disponibles', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { best_flights: [], other_flights: [], search_parameters: {}, search_metadata: {} },
    });
    const result = await searchFlights(makeState());
    expect(result.type).toBe('text');
    expect(result.flights).toHaveLength(0);
  });

  it('ordena los vuelos por precio ascendente', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    const result = await searchFlights(makeState());
    const prices = result.flights.map((f) => f.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('incluye el destino confirmado en recommendations (para DestinationCard)', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    const result = await searchFlights(makeState());
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].name).toBe('Bali');
  });

  it('usa la bookingUrl verificada de google_flights_url', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    const result = await searchFlights(makeState());
    expect(result.flights[0].bookingUrl).toContain('tfs=VERIFIED');
  });

  it('construye los segmentos de vuelo correctamente', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    const result = await searchFlights(makeState());
    // Vuelo de 2 segmentos (precio 1200, índice 1 tras ordenar)
    const connecting = result.flights.find((f) => f.stops === 1);
    expect(connecting).toBeDefined();
    expect(connecting?.segments).toHaveLength(2);
    expect(connecting?.segments?.[0].departureAirport).toBe('LIM');
    expect(connecting?.segments?.[1].arrivalAirport).toBe('DPS');
  });

  it('construye los layovers correctamente', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    const result = await searchFlights(makeState());
    const connecting = result.flights.find((f) => f.stops === 1);
    expect(connecting?.layovers).toHaveLength(1);
    expect(connecting?.layovers?.[0].airport).toBe('BOG');
    expect(connecting?.layovers?.[0].durationMinutes).toBe(90);
  });

  it('vuelo directo tiene nonstop=true y stops=0', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    const result = await searchFlights(makeState());
    const direct = result.flights.find((f) => f.nonstop);
    expect(direct).toBeDefined();
    expect(direct?.stops).toBe(0);
  });

  it('el stage del conversationState resultante es "flight_search"', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    const result = await searchFlights(makeState());
    expect(result.conversationState.stage).toBe('flight_search');
  });

  it('el content incluye el nombre del destino y la aerolínea del mejor precio', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: MOCK_SERP_RESPONSE });
    const result = await searchFlights(makeState());
    expect(result.content).toContain('Bali');
    expect(result.content).toContain('LATAM');
    expect(result.content).toContain('850');
  });
});
