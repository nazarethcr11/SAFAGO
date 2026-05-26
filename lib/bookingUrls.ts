import { Flight } from '@/types';

function toDateStr(isoString: string): string {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function buildBookingUrl(flight: Flight): string {
  const [origin, destination] = flight.route.split('-');
  const depDate = toDateStr(flight.departureTime);

  let query = `Flights+from+${origin}+to+${destination}+on+${depDate}`;
  if (flight.returnDate) {
    query += `+returning+${flight.returnDate}`;
  }

  return `https://www.google.com/travel/flights?q=${query}`;
}
