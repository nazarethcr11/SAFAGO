import { describe, it, expect } from 'vitest';
import { applyHardConstraintFilter } from '@/lib/ai/hardConstraintFilter';
import { createInitialState } from '@/lib/conversationalEngine';
import type { ParsedAiResult } from '@/lib/ai/parseAiResponse';
import type { Destination } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80';

function makeResult(
  recs: Partial<Destination & { region?: string }>[],
  region: string | null = null
): ParsedAiResult {
  return {
    type: 'text',
    content: 'respuesta',
    recommendations: recs as Destination[],
    shouldSearchFlights: false,
    conversationState: {
      ...createInitialState(),
      preferences: { ...createInitialState().preferences, region },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('applyHardConstraintFilter — sin región objetivo', () => {
  it('pasa todas las recomendaciones sin filtrar cuando no hay región', () => {
    const recs = [
      { id: 'r1', name: 'Bali',   country: 'Indonesia', region: 'asia' },
      { id: 'r2', name: 'París',  country: 'Francia',   region: 'europe' },
    ];
    const result = applyHardConstraintFilter(makeResult(recs, null));
    expect(result.recommendations).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('applyHardConstraintFilter — filtro de región', () => {
  it('filtra recomendaciones de región incorrecta', () => {
    const recs = [
      { id: 'bali',  name: 'Bali',  country: 'Indonesia', region: 'asia' },
      { id: 'paris', name: 'París', country: 'Francia',   region: 'europe' },
      { id: 'bkk',   name: 'Bangkok', country: 'Tailandia', region: 'asia' },
    ];
    const result = applyHardConstraintFilter(makeResult(recs, 'asia'));
    expect(result.recommendations).toHaveLength(2);
    expect(result.recommendations.map((r) => r.name)).not.toContain('París');
  });

  it('mantiene todas cuando todas coinciden con la región', () => {
    const recs = [
      { id: 'cdg', name: 'París',    country: 'Francia',   region: 'europe' },
      { id: 'mad', name: 'Madrid',   country: 'España',    region: 'europe' },
      { id: 'rom', name: 'Roma',     country: 'Italia',    region: 'europe' },
    ];
    const result = applyHardConstraintFilter(makeResult(recs, 'europe'));
    expect(result.recommendations).toHaveLength(3);
  });

  it('vacía las recomendaciones cuando TODAS son de región incorrecta', () => {
    const recs = [
      { id: 'bali', name: 'Bali', country: 'Indonesia', region: 'asia' },
    ];
    const result = applyHardConstraintFilter(makeResult(recs, 'europe'));
    expect(result.recommendations).toHaveLength(0);
  });

  it('resuelve región desde el campo country cuando region no está presente', () => {
    const recs = [
      { id: 'bali', name: 'Bali', country: 'Indonesia' },   // sin campo region
    ];
    const result = applyHardConstraintFilter(makeResult(recs, 'asia'));
    expect(result.recommendations).toHaveLength(1);
  });

  it('resuelve región desde el nombre de ciudad vía NAME_PATTERNS', () => {
    const recs = [
      { id: 'tok', name: 'Tokio', country: 'Japón' },       // sin campo region
    ];
    const result = applyHardConstraintFilter(makeResult(recs, 'asia'));
    expect(result.recommendations).toHaveLength(1);
  });

  it('filtra "Cancún" (caribbean) cuando la región objetivo es "europe"', () => {
    const recs = [
      { id: 'cun', name: 'Cancún', country: 'México' },
    ];
    const result = applyHardConstraintFilter(makeResult(recs, 'europe'));
    expect(result.recommendations).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('applyHardConstraintFilter — normalización de campos', () => {
  it('genera un id cuando el objeto no tiene id', () => {
    const recs = [{ name: 'Bali', country: 'Indonesia', region: 'asia' }];
    const result = applyHardConstraintFilter(makeResult(recs, null));
    expect(result.recommendations[0].id).toBeTruthy();
    expect(typeof result.recommendations[0].id).toBe('string');
  });

  it('añade imageUrl de fallback cuando no hay imageUrl', () => {
    const recs = [{ id: 'x', name: 'Bali', country: 'Indonesia', region: 'asia' }];
    const result = applyHardConstraintFilter(makeResult(recs, null));
    expect(result.recommendations[0].imageUrl).toBe(FALLBACK_IMAGE);
  });

  it('añade currency "USD" cuando falta', () => {
    const recs = [{ id: 'x', name: 'Bali', country: 'Indonesia', region: 'asia' }];
    const result = applyHardConstraintFilter(makeResult(recs, null));
    expect(result.recommendations[0].currency).toBe('USD');
  });

  it('añade estimatedPrice 800 cuando falta', () => {
    const recs = [{ id: 'x', name: 'Bali', country: 'Indonesia', region: 'asia' }];
    const result = applyHardConstraintFilter(makeResult(recs, null));
    expect(result.recommendations[0].estimatedPrice).toBe(800);
  });

  it('añade tags vacío cuando faltan', () => {
    const recs = [{ id: 'x', name: 'Bali', country: 'Indonesia', region: 'asia' }];
    const result = applyHardConstraintFilter(makeResult(recs, null));
    expect(result.recommendations[0].tags).toEqual([]);
  });

  it('conserva imageUrl existente cuando ya está presente', () => {
    const recs = [{
      id: 'x', name: 'Bali', country: 'Indonesia', region: 'asia',
      imageUrl: 'https://custom.image.jpg',
    }];
    const result = applyHardConstraintFilter(makeResult(recs, null));
    expect(result.recommendations[0].imageUrl).toBe('https://custom.image.jpg');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('applyHardConstraintFilter — tipo de respuesta', () => {
  it('cambia type a "destinations" cuando hay recomendaciones', () => {
    const recs = [{ id: 'x', name: 'Bali', country: 'Indonesia', region: 'asia' }];
    const result = applyHardConstraintFilter(makeResult(recs, null));
    expect(result.type).toBe('destinations');
  });

  it('mantiene type original cuando no hay recomendaciones', () => {
    const result = applyHardConstraintFilter(makeResult([], null));
    expect(result.type).toBe('text');
  });
});
