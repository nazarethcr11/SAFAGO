import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DestinationCard } from '@/components/chat/DestinationCard';
import type { Destination } from '@/types';

const mockDestination: Destination = {
  id: 'bali',
  name: 'Bali',
  country: 'Indonesia',
  climate: 'tropical',
  estimatedPrice: 1200,
  currency: 'USD',
  tags: ['playa', 'yoga', 'surf'],
  imageUrl: 'https://images.unsplash.com/photo-bali',
  description: 'Isla paradisíaca con templos y playas de ensueño.',
  rating: 4.8,
};

describe('DestinationCard — botón TripAdvisor', () => {
  it('muestra el botón "Ver reseñas"', () => {
    render(<DestinationCard destination={mockDestination} />);
    expect(screen.getByText(/ver reseñas/i)).toBeInTheDocument();
  });

  it('el botón es un enlace que apunta a TripAdvisor', () => {
    render(<DestinationCard destination={mockDestination} />);
    const link = screen.getByRole('link', { name: /ver reseñas/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('tripadvisor.com'));
  });

  it('la URL incluye el nombre del destino', () => {
    render(<DestinationCard destination={mockDestination} />);
    const link = screen.getByRole('link', { name: /ver reseñas/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('Bali'));
  });

  it('abre en pestaña nueva (target="_blank")', () => {
    render(<DestinationCard destination={mockDestination} />);
    const link = screen.getByRole('link', { name: /ver reseñas/i });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('tiene rel="noopener noreferrer" por seguridad', () => {
    render(<DestinationCard destination={mockDestination} />);
    const link = screen.getByRole('link', { name: /ver reseñas/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('muestra el nombre y país del destino', () => {
    render(<DestinationCard destination={mockDestination} />);
    expect(screen.getByText('Bali')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
  });

  it('muestra hasta 3 tags', () => {
    render(<DestinationCard destination={mockDestination} />);
    expect(screen.getByText('playa')).toBeInTheDocument();
    expect(screen.getByText('yoga')).toBeInTheDocument();
    expect(screen.getByText('surf')).toBeInTheDocument();
  });
});
