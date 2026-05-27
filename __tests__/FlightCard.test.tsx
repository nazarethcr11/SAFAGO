import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlightCard } from '@/components/chat/FlightCard';
import type { Flight } from '@/types';

const mockFlight: Flight = {
  flightNumber: 'IB6830',
  airline: 'Iberia',
  route: 'LIM-MAD',
  departureTime: '2025-12-20T23:00:00',
  arrivalTime: '2025-12-21T18:30:00',
  durationMinutes: 810,
  stops: 0,
  nonstop: true,
  price: 850,
  currency: 'USD',
  cabinClass: 'economy',
};

describe('FlightCard — botón de reserva', () => {
  it('muestra el botón "Ver en Google Flights"', () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText(/ver en google flights/i)).toBeInTheDocument();
  });

  it('el botón es un enlace (<a>) que apunta a Google Flights', () => {
    render(<FlightCard flight={mockFlight} />);
    const link = screen.getByRole('link', { name: /ver en google flights/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('google.com/travel/flights'));
  });

  it('la URL incluye los códigos IATA correctos (LIM y MAD)', () => {
    render(<FlightCard flight={mockFlight} />);
    const link = screen.getByRole('link', { name: /ver en google flights/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('LIM'));
    expect(link).toHaveAttribute('href', expect.stringContaining('MAD'));
  });

  it('la URL incluye la fecha de salida (2025-12-20)', () => {
    render(<FlightCard flight={mockFlight} />);
    const link = screen.getByRole('link', { name: /ver en google flights/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('2025-12-20'));
  });

  it('abre en pestaña nueva (target="_blank")', () => {
    render(<FlightCard flight={mockFlight} />);
    const link = screen.getByRole('link', { name: /ver en google flights/i });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('tiene rel="noopener noreferrer" por seguridad', () => {
    render(<FlightCard flight={mockFlight} />);
    const link = screen.getByRole('link', { name: /ver en google flights/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('muestra los datos básicos del vuelo (aerolínea, número, precio)', () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText('Iberia')).toBeInTheDocument();
    expect(screen.getByText('IB6830')).toBeInTheDocument();
  });

  it('muestra badge "Directo" para vuelos sin escalas', () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText('Directo')).toBeInTheDocument();
  });

  it('muestra el número de escalas cuando el vuelo no es directo', () => {
    const withStop = { ...mockFlight, nonstop: false, stops: 1 };
    render(<FlightCard flight={withStop} />);
    expect(screen.getByText('1 escala')).toBeInTheDocument();
  });

  it('usa bookingUrl verificada si está disponible (precio garantizado)', () => {
    const withBooking = {
      ...mockFlight,
      bookingUrl: 'https://www.google.com/travel/flights?tfs=VERIFIED123',
    };
    render(<FlightCard flight={withBooking} />);
    const link = screen.getByRole('link', { name: /ver en google flights/i });
    expect(link).toHaveAttribute('href', 'https://www.google.com/travel/flights?tfs=VERIFIED123');
  });
});
