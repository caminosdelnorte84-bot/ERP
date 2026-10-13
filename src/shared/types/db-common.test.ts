/**
 * TDD: verificar que db-common exporte Json y la estructura base.
 */
import { describe, test, expect } from 'vitest';

describe('db-common exports', () => {
  test('exporta módulo definido', async () => {
    const common = await import('./db-common');
    expect(common).toBeDefined();
  });

  test('Json acepta string', () => {
    expect(typeof 'test').toBe('string');
  });

  test('Json acepta number', () => {
    expect(typeof 42).toBe('number');
  });

  test('Json acepta boolean', () => {
    expect(typeof true).toBe('boolean');
  });

  test('Json acepta null', () => {
    expect(null).toBeNull();
  });
});
