import { Flight } from '@/types';

/**
 * Extrae YYYY-MM-DD de un ISO string o de "YYYY-MM-DD HH:mm".
 * Usado solo en el fallback cuando no hay bookingUrl verificada.
 */
function toDateStr(dateStr: string): string {
  const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Retorna la URL de reserva para un vuelo.
 *
 * Prioridad:
 *  1. `flight.bookingUrl` — URL verificada que proviene de SerpAPI
 *     (search_metadata.google_flights_url). Abre la misma búsqueda en
 *     Google Flights con precios idénticos a los mostrados.
 *  2. URL de consulta en lenguaje natural — fallback para vuelos mock
 *     en modo dev (sin N8N).
 */
export function buildBookingUrl(flight: Flight): string {
  if (flight.bookingUrl) return flight.bookingUrl;

  // Fallback: query natural de Google Flights
  const parts = flight.route.split('-');
  const origin = parts[0];
  const destination = parts[parts.length - 1];

  const depDate = flight.searchDate || toDateStr(flight.departureTime);

  let query = `Flights+from+${origin}+to+${destination}+on+${depDate}`;
  if (flight.returnDate) query += `+returning+${flight.returnDate}`;

  return `https://www.google.com/travel/flights?q=${query}`;
}
