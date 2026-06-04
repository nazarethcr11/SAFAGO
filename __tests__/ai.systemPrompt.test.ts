import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '@/lib/ai/systemPrompt';
import { createInitialState } from '@/lib/conversationalEngine';
import type { ConversationState } from '@/types';

const baseState: ConversationState = createInitialState();

describe('buildSystemPrompt', () => {
  it('incluye la fase actual del estado', () => {
    const state = { ...baseState, stage: 'refinement' as const };
    const prompt = buildSystemPrompt(state, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('Fase: refinement');
  });

  it('incluye el turno actual', () => {
    const state = { ...baseState, turnCount: 3 };
    const prompt = buildSystemPrompt(state, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('Turno: 3');
  });

  it('muestra "ninguno" cuando no hay destino confirmado', () => {
    const prompt = buildSystemPrompt(baseState, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('Destino confirmado: ninguno');
  });

  it('muestra el nombre del destino confirmado cuando existe', () => {
    const state: ConversationState = {
      ...baseState,
      confirmedDestination: {
        id: 'asia-bali', name: 'Bali', country: 'Indonesia',
        climate: 'Tropical', estimatedPrice: 950, currency: 'USD',
        tags: [], imageUrl: '', description: '',
      },
    };
    const prompt = buildSystemPrompt(state, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('Destino confirmado: Bali');
  });

  it('inyecta la fecha actual en formato YYYY-MM-DD', () => {
    // Use noon local time to avoid UTC midnight→previous-day shift in UTC-5 zones
    const prompt = buildSystemPrompt(baseState, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('FECHA ACTUAL DE REFERENCIA: 2026-06-04');
    expect(prompt).toContain('Mes actual: 06');
    expect(prompt).toContain('Año actual: 2026');
  });

  it('los ejemplos de inferencia de año son correctos (mes pasado → siguiente año)', () => {
    // Date: 2026-06-04 (noon) → enero (1 < 6) debe ser 2027; marzo (3 < 6) debe ser 2027
    const prompt = buildSystemPrompt(baseState, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('2027-01-11');
    expect(prompt).toContain('2027-03-15');
  });

  it('los ejemplos de inferencia de año son correctos (mes futuro → mismo año)', () => {
    // Date: 2026-06-04 (noon) → agosto (8 >= 6) debe ser 2026
    const prompt = buildSystemPrompt(baseState, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('2026-08-08');
  });

  it('contiene la instrucción de respuesta JSON', () => {
    const prompt = buildSystemPrompt(baseState, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('FORMATO DE RESPUESTA: JSON VALIDO UNICAMENTE');
    expect(prompt).toContain('shouldSearchFlights');
    expect(prompt).toContain('updatedPreferences');
  });

  it('contiene las reglas de hard constraints', () => {
    const prompt = buildSystemPrompt(baseState, new Date('2026-06-04T12:00:00'));
    expect(prompt).toContain('REGLA DE ORO - HARD CONSTRAINTS');
    expect(prompt).toContain('NUNCA mezcles regiones');
  });
});
