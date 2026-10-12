import { describe, it, expect } from 'vitest';
import { OrderStatus, getNextStatus, getPreviousStatus, isValidStatusTransition, getStatusLabel, getStatusColor } from './status';

describe('shared/utils/status', () => {
  describe('OrderStatus enum', () => {
    it('debe tener los valores esperados', () => {
      expect(OrderStatus.PENDING).toBe('pendiente');
      expect(OrderStatus.PARTIAL).toBe('parcial');
      expect(OrderStatus.DELIVERED).toBe('entregado');
      expect(OrderStatus.CANCELLED).toBe('cancelado');
    });
  });

  describe('getNextStatus', () => {
    it('debe devolver el siguiente estado correcto', () => {
      expect(getNextStatus(OrderStatus.PENDING)).toBe(OrderStatus.PARTIAL);
      expect(getNextStatus(OrderStatus.PARTIAL)).toBe(OrderStatus.DELIVERED);
      expect(getNextStatus(OrderStatus.DELIVERED)).toBeNull(); // No hay siguiente después de entregado
      expect(getNextStatus(OrderStatus.CANCELLED)).toBeNull(); // No hay siguiente después de cancelado
    });
  });

  describe('getPreviousStatus', () => {
    it('debe devolver el estado anterior correcto', () => {
      expect(getPreviousStatus(OrderStatus.PENDING)).toBeNull(); // No hay anterior antes de pendiente
      expect(getPreviousStatus(OrderStatus.PARTIAL)).toBe(OrderStatus.PENDING);
      expect(getPreviousStatus(OrderStatus.DELIVERED)).toBe(OrderStatus.PARTIAL);
      expect(getPreviousStatus(OrderStatus.CANCELLED)).toBeNull(); // No hay anterior definido para cancelado
    });
  });

  describe('isValidStatusTransition', () => {
    it('debe validar transiciones correctas', () => {
      expect(isValidStatusTransition(OrderStatus.PENDING, OrderStatus.PARTIAL)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.PARTIAL, OrderStatus.DELIVERED)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.PARTIAL, OrderStatus.CANCELLED)).toBe(true);

      // Transiciones inválidas
      expect(isValidStatusTransition(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(false); // No se puede saltar de PENDING a DELIVERED
      expect(isValidStatusTransition(OrderStatus.DELIVERED, OrderStatus.PARTIAL)).toBe(false); // No se puede volver atrás
      expect(isValidStatusTransition(OrderStatus.CANCELLED, OrderStatus.PENDING)).toBe(false); // No se puede reactivar un pedido cancelado
      expect(isValidStatusTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false); // No se puede cancelar un pedido ya entregado
      expect(isValidStatusTransition(OrderStatus.CANCELLED, OrderStatus.PARTIAL)).toBe(false); // No se puede cambiar de cancelado a parcial
    });
  });

  describe('getStatusLabel', () => {
    it('debe devolver la etiqueta correcta para cada estado', () => {
      expect(getStatusLabel(OrderStatus.PENDING)).toBe('Pendiente');
      expect(getStatusLabel(OrderStatus.PARTIAL)).toBe('Parcial');
      expect(getStatusLabel(OrderStatus.DELIVERED)).toBe('Entregado');
      expect(getStatusLabel(OrderStatus.CANCELLED)).toBe('Cancelado');
    });
  });

  describe('getStatusColor', () => {
    it('debe devolver el color correcto para cada estado', () => {
      expect(getStatusColor(OrderStatus.PENDING)).toBe('bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400');
      expect(getStatusColor(OrderStatus.PARTIAL)).toBe('bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400');
      expect(getStatusColor(OrderStatus.DELIVERED)).toBe('bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400');
      expect(getStatusColor(OrderStatus.CANCELLED)).toBe('bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400');
    });
  });
});