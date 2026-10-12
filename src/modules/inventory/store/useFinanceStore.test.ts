import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFinanceStore } from './useFinanceStore';

// Mock localStorage for Vitest (though this store doesn't use it directly)
// Mock the global localStorage object just in case
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

// Mock de las dependencias externas
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }),
  },
}));

vi.mock('../../../store/useTenantStore', () => ({
  useTenantStore: {
    getState: vi.fn().mockReturnValue({
      activeCompanyId: 'test-company-id',
    }),
    subscribe: vi.fn(),
  },
}));

describe('useFinanceStore', () => {
  beforeEach(() => {
    // Reinicializar el store antes de cada prueba
    useFinanceStore.setState({
      metrics: {
        totalIncome: 0, totalExpenses: 0, balance: 0,
        pendingPayables: 0, pendingReceivables: 0,
        stockCost: 0, stockValue: 0, projectedProfit: 0, avgMargin: 0,
        moneyInStreet: 0, patrimonio: 0,
      },
      monthlyTrend: [],
      categoryBreakdown: [],
      businessUnitBreakdown: [],
      agingReceivables: [],
      agingPayables: [],
      orderPipeline: { totalPending: 0, countPending: 0, totalDelivered: 0, countDelivered: 0, totalCancelled: 0, advancePayments: 0, conversionRate: 0 },
      projections: [],
      todayActivity: { income: 0, expenses: 0, transactions: 0, orders: 0 },
      isLoading: false,
    });

    // Limpiar mocks
    vi.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con valores por defecto en métricas', () => {
      const state = useFinanceStore.getState();
      expect(state.metrics.totalIncome).toBe(0);
      expect(state.metrics.totalExpenses).toBe(0);
      expect(state.metrics.balance).toBe(0);
      expect(state.metrics.pendingPayables).toBe(0);
      expect(state.metrics.pendingReceivables).toBe(0);
      expect(state.metrics.stockCost).toBe(0);
      expect(state.metrics.stockValue).toBe(0);
      expect(state.metrics.projectedProfit).toBe(0);
      expect(state.metrics.avgMargin).toBe(0);
      expect(state.metrics.moneyInStreet).toBe(0);
      expect(state.metrics.patrimonio).toBe(0);
    });

    it('debe inicializar con arrays vacíos para listas', () => {
      const state = useFinanceStore.getState();
      expect(state.monthlyTrend).toHaveLength(0);
      expect(state.categoryBreakdown).toHaveLength(0);
      expect(state.businessUnitBreakdown).toHaveLength(0);
      expect(state.agingReceivables).toHaveLength(0);
      expect(state.agingPayables).toHaveLength(0);
      expect(state.projections).toHaveLength(0);
      expect(state.todayActivity).toEqual({ income: 0, expenses: 0, transactions: 0, orders: 0 });
    });

    it('debe inicializar con pipeline de órdenes vacío', () => {
      const state = useFinanceStore.getState();
      expect(state.orderPipeline).toEqual({
        totalPending: 0, countPending: 0, totalDelivered: 0, countDelivered: 0,
        totalCancelled: 0, advancePayments: 0, conversionRate: 0
      });
    });

    it('debe iniciar con isLoading en false', () => {
      const state = useFinanceStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Actualización de estado', () => {
    it('debe poder actualizar métricas financieras', () => {
      const newMetrics = {
        totalIncome: 1000,
        totalExpenses: 600,
        balance: 400,
        pendingPayables: 50,
        pendingReceivables: 100,
        stockCost: 200,
        stockValue: 300,
        projectedProfit: 100,
        avgMargin: 50,
        moneyInStreet: 150,
        patrimonio: 650,
      };

      useFinanceStore.setState({ metrics: newMetrics });
      const state = useFinanceStore.getState();
      expect(state.metrics).toEqual(newMetrics);
    });

    it('debe poder actualizar tendencias mensuales', () => {
      const mockMonthlyData: Array<{ month: string; label: string; income: number; expenses: number }> = [
        { month: '2026-01', label: 'Ene', income: 1000, expenses: 600 },
        { month: '2026-02', label: 'Feb', income: 1200, expenses: 700 },
      ];

      useFinanceStore.setState({ monthlyTrend: mockMonthlyData });
      const state = useFinanceStore.getState();
      expect(state.monthlyTrend).toHaveLength(2);
      expect(state.monthlyTrend[0]).toEqual({ month: '2026-01', label: 'Ene', income: 1000, expenses: 600 });
      expect(state.monthlyTrend[1]).toEqual({ month: '2026-02', label: 'Feb', income: 1200, expenses: 700 });
    });

    it('debe poder actualizar desglose por categoría', () => {
      const mockCategoryBreakdown: Array<{ name: string; income: number; expense: number; net: number }> = [
        { name: 'VENTAS', income: 1500, expense: 200, net: 1300 },
        { name: 'SERVICIOS', income: 800, expense: 150, net: 650 },
      ];

      useFinanceStore.setState({ categoryBreakdown: mockCategoryBreakdown });
      const state = useFinanceStore.getState();
      expect(state.categoryBreakdown).toHaveLength(2);
      expect(state.categoryBreakdown[0]).toEqual({ name: 'VENTAS', income: 1500, expense: 200, net: 1300 });
      expect(state.categoryBreakdown[1]).toEqual({ name: 'SERVICIOS', income: 800, expense: 150, net: 650 });
    });

    it('debe poder actualizar desglose por unidad de negocio', () => {
      const mockBusinessUnitBreakdown: Array<{ unit: string; income: number; expense: number; orders: number; revenue: number }> = [
        { unit: 'RAICES', income: 2000, expense: 500, orders: 10, revenue: 1800 },
        { unit: 'GENERAL', income: 800, expense: 200, orders: 5, revenue: 700 },
      ];

      useFinanceStore.setState({ businessUnitBreakdown: mockBusinessUnitBreakdown });
      const state = useFinanceStore.getState();
      expect(state.businessUnitBreakdown).toHaveLength(2);
      expect(state.businessUnitBreakdown[0]).toEqual({ unit: 'RAICES', income: 2000, expense: 500, orders: 10, revenue: 1800 });
      expect(state.businessUnitBreakdown[1]).toEqual({ unit: 'GENERAL', income: 800, expense: 200, orders: 5, revenue: 700 });
    });

    it('debe poder actualizar pipeline de órdenes', () => {
      const mockPipeline = {
        totalPending: 5000,
        countPending: 25,
        totalDelivered: 3000,
        countDelivered: 15,
        totalCancelled: 500,
        advancePayments: 800,
        conversionRate: 37.5,
      };

      useFinanceStore.setState({ orderPipeline: mockPipeline });
      const state = useFinanceStore.getState();
      expect(state.orderPipeline).toEqual(mockPipeline);
    });

    it('debe poder actualizar proyecciones', () => {
      const mockProjections: Array<{ label: string; value: number; confidence: 'high' | 'medium' | 'low' }> = [
        { label: 'Ingresos Próx. Mes', value: 1200, confidence: 'high' },
        { label: 'Gastos Próx. Mes', value: 800, confidence: 'medium' },
        { label: 'Utilidad Esperada', value: 400, confidence: 'low' },
      ];

      useFinanceStore.setState({ projections: mockProjections });
      const state = useFinanceStore.getState();
      expect(state.projections).toHaveLength(3);
      expect(state.projections[0]).toEqual({ label: 'Ingresos Próx. Mes', value: 1200, confidence: 'high' });
      expect(state.projections[1]).toEqual({ label: 'Gastos Próx. Mes', value: 800, confidence: 'medium' });
      expect(state.projections[2]).toEqual({ label: 'Utilidad Esperada', value: 400, confidence: 'low' });
    });

    it('debe poder actualizar actividad de hoy', () => {
      const mockTodayActivity = { income: 500, expenses: 300, transactions: 10, orders: 5 };

      useFinanceStore.setState({ todayActivity: mockTodayActivity });
      const state = useFinanceStore.getState();
      expect(state.todayActivity).toEqual(mockTodayActivity);
    });

    it('debe poder establecer y limpiar estados de loading', () => {
      useFinanceStore.setState({ isLoading: true });
      expect(useFinanceStore.getState().isLoading).toBe(true);

      useFinanceStore.setState({ isLoading: false });
      expect(useFinanceStore.getState().isLoading).toBe(false);
    });
  });
});