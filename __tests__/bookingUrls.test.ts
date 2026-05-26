import { describe, it, expect } from 'vitest';
import { buildBookingUrl } from '@/lib/bookingUrls';
import type { Flight } from '@/types';

const baseFlight: Flight = {
  flightNumber: 'LA2091',
  airline: 'LATAM',
  route: 'LIM-BRC',
  departureTime: '2025-12-15T08:30:00',
  arrivalTime: '2025-12-15T14:00:00',
  durationMinutes: 210,
  stops: 0,
  nonstop: true,
  price: 320,
  currency: 'USD',
};

describe('buildBookingUrl', () => {
  it('genera URL de Google Flights con los IATA correctos', () => {
    const url = buildBookingUrl(baseFlight);
    expect(url).toContain('google.com/travel/flights');
    expect(url).toContain('LIM');
    expect(url).toContain('BRC');
  });

  it('incluye la fecha de salida en formato YYYY-MM-DD', () => {
    const url = buildBookingUrl(baseFlight);
    expect(url).toContain('2025-12-15');
  });

  it('URL completa (ida) tiene el formato correcto', () => {
    const url = buildBookingUrl(baseFlight);
    expect(url).toBe(
      'https://www.google.com/travel/flights?q=Flights+from+LIM+to+BRC+on+2025-12-15'
    );
  });

  it('incluye la fecha de vuelta cuando está disponible', () => {
    const roundTrip = { ...baseFlight, returnDate: '2025-12-25' };
    expect(buildBookingUrl(roundTrip)).toBe(
      'https://www.google.com/travel/flights?q=Flights+from+LIM+to+BRC+on+2025-12-15+returning+2025-12-25'
    );
  });

  it('no incluye "returning" cuando no hay fecha de vuelta', () => {
    const url = buildBookingUrl(baseFlight);
    expect(url).not.toContain('returning');
  });

  it('funciona con distintas rutas internacionales', () => {
    const madrid = { ...baseFlight, route: 'LIM-MAD', departureTime: '2025-08-01T22:00:00' };
    expect(buildBookingUrl(madrid)).toBe(
      'https://www.google.com/travel/flights?q=Flights+from+LIM+to+MAD+on+2025-08-01'
    );
  });

  it('funciona con ruta caribeña', () => {
    const cancun = { ...baseFlight, route: 'BOG-CUN', departureTime: '2026-01-05T06:00:00' };
    expect(buildBookingUrl(cancun)).toBe(
      'https://www.google.com/travel/flights?q=Flights+from+BOG+to+CUN+on+2026-01-05'
    );
  });

  it('rellena con cero el mes y día menores a 10', () => {
    const enero = { ...baseFlight, route: 'LIM-GRU', departureTime: '2026-01-09T10:00:00' };
    expect(buildBookingUrl(enero)).toContain('2026-01-09');
  });
});
