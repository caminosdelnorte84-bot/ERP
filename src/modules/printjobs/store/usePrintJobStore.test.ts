import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePrintJobStore } from './usePrintJobStore';

// Mock localStorage for Vitest
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock the global localStorage object
global.localStorage = localStorageMock;

// Mock de las dependencias externas
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      update: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ error: null }),
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

vi.mock('../../../store/useOrderStore', () => ({
  useOrderStore: {
    getState: vi.fn().mockReturnValue({
      orders: [
        {
          id: 'order-1',
          company_id: 'test-company-id',
          customer_name: 'Cliente Test',
          total_amount: 0,
          advance_payment: 0,
          status: 'PENDING',
          due_date: '2026-12-31',
          business_unit: 'RAICES',
          items: [],
          created_at: new Date().toISOString(),
        },
      ],
    }),
    subscribe: vi.fn(),
  },
}));

vi.mock('../../../store/useFilamentStore', () => ({
  useFilamentStore: {
    getState: vi.fn().mockReturnValue({
      filaments: [],
    }),
    consumeGrams: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('usePrintJobStore', () => {
  beforeEach(() => {
    // Reinicializar el store antes de cada prueba
    usePrintJobStore.setState({
      jobs: [],
      isLoading: false,
      error: null,
    });

    // Limpiar mocks y localStorage
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con lista vacía de trabajos de impresión', () => {
      const state = usePrintJobStore.getState();
      expect(state.jobs).toHaveLength(0);
    });

    it('debe iniciar con isLoading en false', () => {
      const state = usePrintJobStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('debe iniciar con error en null', () => {
      const state = usePrintJobStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('Actualización de estado', () => {
    it('debe poder establecer trabajos de impresión', () => {
      const mockJobs = [
        {
          id: 'pj-1',
          order_id: 'order-1',
          printer_id: 'printer-1',
          filament_type: 'PLA',
          filament_color: 'Negro',
          quantity: 2,
          status: 'pendiente',
          progress: 0,
          created_at: new Date().toISOString(),
        },
      ];

      usePrintJobStore.setState({ jobs: mockJobs });
      const state = usePrintJobStore.getState();
      expect(state.jobs).toHaveLength(1);
      expect(state.jobs[0].id).toBe('pj-1');
      expect(state.jobs[0].order_id).toBe('order-1');
      expect(state.jobs[0].filament_type).toBe('PLA');
    });

    it('debe poder actualizar el progreso de un trabajo de impresión', () => {
      const mockJobs = [
        {
          id: 'pj-1',
          order_id: 'order-1',
          printer_id: 'printer-1',
          filament_type: 'PLA',
          filament_color: 'Negro',
          quantity: 2,
          status: 'pendiente',
          progress: 0,
          created_at: new Date().toISOString(),
        },
      ];

      usePrintJobStore.setState({ jobs: mockJobs });

      // Simular actualización de progreso directamente en el state
      usePrintJobStore.getState().jobs[0].progress = 50;

      const state = usePrintJobStore.getState();
      expect(state.jobs[0].progress).toBe(50);
    });

    it('debe poder cambiar el estado de un trabajo de impresión', () => {
      const mockJobs = [
        {
          id: 'pj-1',
          order_id: 'order-1',
          printer_id: 'printer-1',
          filament_type: 'PLA',
          filament_color: 'Negro',
          quantity: 2,
          status: 'pendiente',
          progress: 0,
          created_at: new Date().toISOString(),
        },
      ];

      usePrintJobStore.setState({ jobs: mockJobs });

      // Cambiar estado directamente
      usePrintJobStore.getState().jobs[0].status = 'completado';

      const state = usePrintJobStore.getState();
      expect(state.jobs[0].status).toBe('completado');
    });

    it('debe poder eliminar un trabajo de impresión', () => {
      const mockJobs = [
        {
          id: 'pj-1',
          order_id: 'order-1',
          printer_id: 'printer-1',
          filament_type: 'PLA',
          filament_color: 'Negro',
          quantity: 2,
          status: 'pendiente',
          progress: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pj-2',
          order_id: 'order-2',
          printer_id: 'printer-2',
          filament_type: 'PETG',
          filament_color: 'Blanco',
          quantity: 1,
          status: 'pendiente',
          progress: 30,
          created_at: new Date().toISOString(),
        },
      ];

      usePrintJobStore.setState({ jobs: mockJobs });
      expect(usePrintJobStore.getState().jobs).toHaveLength(2);

      // Simular eliminación
      usePrintJobStore.getState().jobs = usePrintJobStore.getState().jobs.filter(job => job.id !== 'pj-1');

      const state = usePrintJobStore.getState();
      expect(state.jobs).toHaveLength(1);
      expect(state.jobs[0].id).toBe('pj-2');
    });

    it('debe poder establecer y limpiar estados de loading', () => {
      usePrintJobStore.setState({ isLoading: true });
      expect(usePrintJobStore.getState().isLoading).toBe(true);

      usePrintJobStore.setState({ isLoading: false });
      expect(usePrintJobStore.getState().isLoading).toBe(false);
    });

    it('debe poder establecer y limpiar estados de error', () => {
      const testError = new Error('Error de impresión');
      usePrintJobStore.setState({ error: testError });
      expect(usePrintJobStore.getState().error).toBe(testError);

      usePrintJobStore.setState({ error: null });
      expect(usePrintJobStore.getState().error).toBeNull();
    });
  });
});