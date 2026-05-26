import { describe, it, expect } from 'vitest';
import { buildTripAdvisorUrl } from '@/lib/tripAdvisorUrls';
import type { Destination } from '@/types';

const baseDestination: Destination = {
  id: 'bali',
  name: 'Bali',
  country: 'Indonesia',
  climate: 'tropical',
  estimatedPrice: 1200,
  currency: 'USD',
  tags: ['playa', 'yoga', 'surf'],
  imageUrl: 'https://example.com/bali.jpg',
  description: 'Isla paradisíaca en Indonesia.',
  rating: 4.8,
};

describe('buildTripAdvisorUrl', () => {
  it('genera URL de TripAdvisor con el dominio correcto', () => {
    const url = buildTripAdvisorUrl(baseDestination);
    expect(url).toContain('tripadvisor.com/Search');
  });

  it('incluye el nombre del destino en el query', () => {
    const url = buildTripAdvisorUrl(baseDestination);
    expect(url).toContain('Bali');
  });

  it('incluye el país en el query', () => {
    const url = buildTripAdvisorUrl(baseDestination);
    expect(url).toContain('Indonesia');
  });

  it('codifica correctamente nombres con espacios', () => {
    const dest = { ...baseDestination, name: 'Buenos Aires', country: 'Argentina' };
    const url = buildTripAdvisorUrl(dest);
    expect(url).toContain('Buenos%20Aires');
    expect(url).toContain('Argentina');
  });

  it('codifica correctamente caracteres especiales', () => {
    const dest = { ...baseDestination, name: 'Río de Janeiro', country: 'Brasil' };
    const url = buildTripAdvisorUrl(dest);
    expect(url).toContain('tripadvisor.com/Search?q=');
    expect(decodeURIComponent(url)).toContain('Río de Janeiro');
  });
});
