import { describe, it, expect } from 'vitest';
import { numberToWordsSpanish } from './receiptFormatters';

describe('numberToWordsSpanish', () => {
  it('convierte números menores a 30 correctamente', () => {
    expect(numberToWordsSpanish(0)).toBe('cero');
    expect(numberToWordsSpanish(1)).toBe('uno');
    expect(numberToWordsSpanish(15)).toBe('quince');
    expect(numberToWordsSpanish(20)).toBe('veinte');
    expect(numberToWordsSpanish(28)).toBe('veintiocho');
  });

  it('convierte decenas compuestas', () => {
    expect(numberToWordsSpanish(30)).toBe('treinta');
    expect(numberToWordsSpanish(35)).toBe('treinta y cinco');
    expect(numberToWordsSpanish(99)).toBe('noventa y nueve');
  });

  it('convierte centenas exactas e intermedias', () => {
    expect(numberToWordsSpanish(100)).toBe('cien');
    expect(numberToWordsSpanish(105)).toBe('ciento cinco');
    expect(numberToWordsSpanish(500)).toBe('quinientos');
    expect(numberToWordsSpanish(750)).toBe('setecientos cincuenta');
  });

  it('convierte miles y montos habituales en pesos', () => {
    expect(numberToWordsSpanish(1000)).toBe('mil');
    expect(numberToWordsSpanish(1500)).toBe('mil quinientos');
    expect(numberToWordsSpanish(4000)).toBe('cuatro mil');
    expect(numberToWordsSpanish(12500)).toBe('doce mil quinientos');
    expect(numberToWordsSpanish(100000)).toBe('cien mil');
  });

  it('convierte millones', () => {
    expect(numberToWordsSpanish(1000000)).toBe('un millón');
    expect(numberToWordsSpanish(2500000)).toBe('dos millones quinientos mil');
  });
});

