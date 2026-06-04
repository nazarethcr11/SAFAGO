import axios from 'axios';
import { ConversationState, Flight, FlightSegment, FlightLayover, Destination } from '@/types';

export interface FlightSearchResult {
  type: 'flights' | 'text';
  content: string;
  flights: Flight[];
  recommendations: Destination[];
  conversationState: ConversationState;
}

// ── Validation ────────────────────────────────────────────────────────────────

export class FlightParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FlightParamError';
  }
}

function validateFlightParams(state: ConversationState): void {
  if (!state.confirmedDestination) {
    throw new FlightParamError('No hay destino confirmado para buscar vuelos.');
  }
  if (!state.preferences.originIata) {
    throw new FlightParamError('Falta el IATA de origen para buscar vuelos.');
  }
  if (!state.destinationIata) {
    throw new FlightParamError('Falta el IATA de destino para buscar vuelos.');
  }
  if (!state.departureDate) {
    throw new FlightParamError('Falta la fecha de salida para buscar vuelos.');
  }
}

// ── SerpAPI call ──────────────────────────────────────────────────────────────

interface SerpApiResponse {
  best_flights?: SerpFlight[];
  other_flights?: SerpFlight[];
  search_parameters?: { outbound_date?: string; currency?: string };
  search_metadata?: { google_flights_url?: string };
}

interface SerpFlight {
  flights?: SerpSegment[];
  layovers?: SerpLayover[];
  price?: number;
  total_duration?: number;
  airline_logo?: string;
}

interface SerpSegment {
  flight_number?: string;
  airline?: string;
  airline_logo?: string;
  departure_airport?: { id?: string; name?: string; time?: string };
  arrival_airport?: { id?: string; name?: string; time?: string };
  duration?: number;
  airplane?: string;
  travel_class?: string;
  overnight?: boolean;
}

interface SerpLayover {
  id?: string;
  name?: string;
  duration?: number;
  overnight?: boolean;
}

async function fetchFromSerpApi(state: ConversationState): Promise<SerpApiResponse> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SERPAPI_KEY no configurada.');

  // Build params — only include return_date when tripType === 1 (round trip)
  const params: Record<string, string> = {
    engine:       'google_flights',
    departure_id: state.preferences.originIata!,
    arrival_id:   state.destinationIata!,
    outbound_date: state.departureDate!,
    adults:       String(state.preferences.travelers || 1),
    currency:     'USD',
    hl:           'es',
    gl:           'pe',
    type:         String(state.tripType ?? 2),
    deep_search:  'true',
    api_key:      apiKey,
  };

  // FIX: return_date only sent for round trips (tripType === 1)
  if (state.tripType === 1 && state.returnDate) {
    params.return_date = state.returnDate;
  }

  const { data } = await axios.get<SerpApiResponse>('https://serpapi.com/search.json', {
    params,
    timeout: 25000,
  });

  return data;
}

// ── Flight processor ──────────────────────────────────────────────────────────

function processFlights(
  data: SerpApiResponse,
  state: ConversationState
): FlightSearchResult {
  const allFlights = [...(data.best_flights ?? []), ...(data.other_flights ?? [])];

  if (!allFlights.length) {
    return {
      type: 'text',
      content:
        '😔 No encontré vuelos disponibles para esa ruta en esas fechas. Prueba con otras fechas o cuéntame si quieres explorar un destino alternativo.',
      flights: [],
      recommendations: [],
      conversationState: { ...state, stage: 'date_selection' },
    };
  }

  const searchDate  = data.search_parameters?.outbound_date ?? null;
  const returnDate  = state.returnDate ?? null;
  const currency    = data.search_parameters?.currency ?? 'USD';
  const googleFlightsUrl = data.search_metadata?.google_flights_url ?? null;

  const processed: Flight[] = [];

  for (const option of allFlights.slice(0, 5)) {
    const segs = option.flights ?? [];
    if (!segs.length || !option.price) continue;

    const first = segs[0];
    const last  = segs[segs.length - 1];

    // Full route string: e.g. LIM-BOG-MAD
    const routeParts: string[] = [first.departure_airport?.id ?? ''];
    segs.forEach((f) => routeParts.push(f.arrival_airport?.id ?? ''));

    const segments: FlightSegment[] = segs.map((seg) => ({
      flightNumber:       seg.flight_number        ?? 'N/A',
      airline:            seg.airline              ?? 'Unknown',
      airlineLogo:        seg.airline_logo         ?? undefined,
      departureAirport:   seg.departure_airport?.id   ?? '',
      departureAirportName: seg.departure_airport?.name ?? '',
      departureTime:      seg.departure_airport?.time  ?? '',
      arrivalAirport:     seg.arrival_airport?.id   ?? '',
      arrivalAirportName: seg.arrival_airport?.name ?? '',
      arrivalTime:        seg.arrival_airport?.time  ?? '',
      durationMinutes:    seg.duration             ?? 0,
      airplane:           seg.airplane             ?? undefined,
      cabinClass:         seg.travel_class         ?? 'Economy',
      overnight:          seg.overnight            ?? false,
    }));

    const layovers: FlightLayover[] = (option.layovers ?? []).map((lay) => ({
      airport:         lay.id       ?? '',
      airportName:     lay.name     ?? '',
      durationMinutes: lay.duration ?? 0,
      overnight:       lay.overnight ?? false,
    }));

    const airlines   = [...new Set(segs.map((s) => s.airline).filter(Boolean))] as string[];
    const airlineName = airlines.join(' + ');

    const bookingUrl =
      googleFlightsUrl ??
      `https://www.google.com/travel/flights?q=Flights+from+${first.departure_airport?.id}+to+${last.arrival_airport?.id}+on+${searchDate}${returnDate ? '+returning+' + returnDate : ''}`;

    processed.push({
      flightNumber:       first.flight_number                  ?? 'N/A',
      airline:            airlineName,
      airlineLogo:        option.airline_logo ?? first.airline_logo ?? undefined,
      route:              routeParts.join('-'),
      originAirport:      first.departure_airport?.name        ?? undefined,
      destinationAirport: last.arrival_airport?.name           ?? undefined,
      departureTime:      first.departure_airport?.time        ?? '',
      arrivalTime:        last.arrival_airport?.time           ?? '',
      durationMinutes:    option.total_duration                ?? 0,
      stops:              segs.length - 1,
      nonstop:            segs.length === 1,
      price:              option.price,
      currency,
      cabinClass:         first.travel_class ?? 'Economy',
      searchDate:         searchDate ?? undefined,
      returnDate:         returnDate ?? undefined,
      bookingUrl,
      segments,
      layovers,
      trendEmoji:         '➖',
      recommendation:     'Precio real',
    });
  }

  processed.sort((a, b) => a.price - b.price);

  const dest   = state.confirmedDestination;
  const origin = state.preferences.originCity;
  const best   = processed[0];

  let content = `✈️ Aquí están las mejores opciones de vuelo de **${origin}** a **${dest?.name}** — ordenadas de menor a mayor precio:`;
  if (best) {
    const hrs = Math.floor(best.durationMinutes / 60);
    const min = best.durationMinutes % 60;
    content += `\n\n🏆 **Mejor opción:** ${best.airline} · $${best.price} USD${
      best.nonstop ? ' · vuelo directo ✅' : ` · ${best.stops} escala${best.stops > 1 ? 's' : ''}`
    } · ${hrs}h ${min}m`;
  }

  return {
    type: 'flights',
    content,
    flights: processed,
    // Include confirmed destination so DestinationCard (with TripAdvisor) renders alongside flights
    recommendations: dest ? [dest] : [],
    conversationState: { ...state, stage: 'flight_search' },
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function searchFlights(state: ConversationState): Promise<FlightSearchResult> {
  validateFlightParams(state);
  const data = await fetchFromSerpApi(state);
  return processFlights(data, state);
}
