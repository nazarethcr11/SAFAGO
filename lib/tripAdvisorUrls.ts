import { Destination } from '@/types';

export function buildTripAdvisorUrl(destination: Destination): string {
  const query = encodeURIComponent(`${destination.name} ${destination.country}`);
  return `https://www.tripadvisor.com/Search?q=${query}`;
}
