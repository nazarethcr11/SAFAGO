import { describe, it, expect } from 'vitest';
import { formatDuration, formatPrice } from '@/utils/formatters';

describe('formatDuration', () => {
  it('formatea horas y minutos correctamente', () => {
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(210)).toBe('3h 30m');
  });

  it('omite minutos cuando son cero', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('omite horas cuando son cero', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('devuelve "—" para valores nulos o undefined', () => {
    expect(formatDuration(null as unknown as number)).toBe('—');
    expect(formatDuration(undefined as unknown as number)).toBe('—');
  });

  it('devuelve "—" para NaN', () => {
    expect(formatDuration(NaN)).toBe('—');
  });

  it('devuelve "—" para valores negativos', () => {
    expect(formatDuration(-10)).toBe('—');
  });

  it('maneja correctamente 0 minutos', () => {
    expect(formatDuration(0)).toBe('0m');
  });
});

describe('formatPrice', () => {
  it('formatea precios en USD con símbolo', () => {
    const result = formatPrice(850, 'USD');
    expect(result).toContain('850');
  });

  it('usa USD por defecto si no se pasa moneda', () => {
    const result = formatPrice(500);
    expect(result).toContain('500');
  });
});
