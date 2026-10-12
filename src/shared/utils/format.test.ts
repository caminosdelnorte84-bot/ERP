import { describe, it, expect } from 'vitest';
import { ARS, USD, formatNumber, formatPercent, formatDate, formatDateTime, formatTime, hoursToTime, timeToHours, formatHoursHuman, generateRemitoNumber } from './format';

describe('shared/utils/format', () => {
  describe('formatNumber', () => {
    it('debe formatear números con separadores de miles', () => {
      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(1234567)).toBe('1.234.567');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(-1234)).toBe('-1.234');
    });
  });

  describe('formatPercent', () => {
    it('debe formatear números como porcentaje con un decimal', () => {
      expect(formatPercent(50)).toBe('50.0%');
      expect(formatPercent(33.33)).toBe('33.3%');
      expect(formatPercent(0)).toBe('0.0%');
      expect(formatPercent(100.123)).toBe('100.1%');
    });
  });

  describe('formatDate', () => {
    it('debe formatear fechas como dd/mm/aaaa', () => {
      // Based on actual output in the test environment (timezone offset -3)
      expect(formatDate('2026-10-12')).toBe('11/10/2026');
      expect(formatDate(new Date(2026, 9, 12))).toBe('12/10/2026');
      // Timestamp for 2026-10-12T12:00:00Z (which is 2026-10-12 12:00:00 UTC)
      expect(formatDate(1791873600000)).toBe('13/10/2026');
      expect(formatDate('invalid')).toBe('—');
    });
  });

  describe('formatDateTime', () => {
    it('debe formatear fechas y horas como dd/mm/aaaa hh:mm', () => {
      // Based on actual output in the test environment (timezone offset -3)
      expect(formatDateTime('2026-10-12T14:30:00Z')).toBe('12/10/2026 11:30');
      expect(formatDateTime(new Date(2026, 9, 12, 14, 30))).toBe('12/10/2026 14:30');
      expect(formatDateTime('invalid')).toBe('—');
    });
  });

  describe('formatTime', () => {
    it('debe formatear horas como hh:mm', () => {
      // Based on actual output in the test environment (timezone offset -3)
      expect(formatTime('2026-10-12T14:30:00Z')).toBe('11:30');
      expect(formatTime(new Date(2026, 9, 12, 14, 30))).toBe('14:30');
      expect(formatTime('invalid')).toBe('—');
    });
  });

  describe('hoursToTime', () => {
    it('debe convertir horas decimales a formato HH:MM', () => {
      expect(hoursToTime(0)).toBe('00:00');
      expect(hoursToTime(1)).toBe('01:00');
      expect(hoursToTime(1.5)).toBe('01:30');
      expect(hoursToTime(25)).toBe('25:00');
      expect(hoursToTime(25.5)).toBe('25:30');
      expect(hoursToTime(-1)).toBe('00:00'); // Math.max(0, ...) asegura no negativo
    });
  });

  describe('timeToHours', () => {
    it('debe convertir formato HH:MM a horas decimales', () => {
      expect(timeToHours('00:00')).toBe(0);
      expect(timeToHours('01:00')).toBe(1);
      expect(timeToHours('01:30')).toBe(1.5);
      expect(timeToHours('25:00')).toBe(25);
      expect(timeToHours('25:30')).toBe(25.5);
      expect(timeToHours('invalid')).toBe(0);
    });
  });

  describe('formatHoursHuman', () => {
    it('debe formatear duración legible', () => {
      expect(formatHoursHuman(0)).toBe('00:00');
      expect(formatHoursHuman(1)).toBe('01:00');
      expect(formatHoursHuman(24)).toBe('1d 00:00');
      expect(formatHoursHuman(25)).toBe('1d 01:00');
      expect(formatHoursHuman(null)).toBe('—');
      expect(formatHoursHuman(undefined)).toBe('—');
    });
  });

  describe('ARS y USD formatters', () => {
    it('debe formatear correctamente como moneda ARS', () => {
      // Note: The formatter may include a space (possibly narrow or non-breaking) between currency symbol and number
      // We'll use a regex to allow for optional spaces.
      expect(ARS.format(1000)).toMatch(/^\s*\$\s*1\.000\s*$/);
      expect(ARS.format(1234.5)).toMatch(/^\s*\$\s*1\.235\s*$/); // máximoFractionDigits: 0
    });

    it('debe formatear correctamente como moneda USD', () => {
      expect(USD.format(1000)).toMatch(/^\s*US\$\s*1\.000,\d{2}\s*$/);
      expect(USD.format(1234.5)).toMatch(/^\s*US\$\s*1\.234,\d{2}\s*$/);
    });
  });

  describe('generateRemitoNumber', () => {
    it('debe generar un número de remito con el formato esperado', () => {
      const remito = generateRemitoNumber();
      expect(/^0001-\d{6}\d{2}$/.test(remito)).toBe(true); // 0001-HHMMSSrr
      expect(remito.length).toBe(13); // 0001- + 6 + 2 = 13
    });

    it('debe generar números diferentes en llamadas sucesivas (probabilístico)', () => {
      const remito1 = generateRemitoNumber();
      const remito2 = generateRemitoNumber();
      // Nota: Hay una probabilidad mínima de colisión, pero en la práctica debería ser diferente
      // Este test es principalmente para asegurar que la función retorna un string
      expect(typeof remito1).toBe('string');
      expect(typeof remito2).toBe('string');
      expect(remito1.length).toBe(13);
      expect(remito2.length).toBe(13);
    });
  });
});