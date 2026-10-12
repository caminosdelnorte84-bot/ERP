import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useOrderStore } from './useOrderStore';

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
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ error: null }),
    channel: () => ({
      on: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    }),
  },
}));

vi.mock('../../../store/useCatalogStore', () => ({
  useCatalogStore: {
    getState: vi.fn().mockReturnValue({
      fetchAllCatalogs: vi.fn(),
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

describe('useOrderStore', () => {
  beforeEach(() => {
    // Reinicializar el store antes de cada prueba
    useOrderStore.setState({
      orders: [],
      templates: [],
      isLoading: false,
      viewMode: 'list',
      selectedOrders: new Set<string>(),
    });

    // Limpiar mocks y localStorage
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Pedidos', () => {
    it('debe inicializar con lista vacía de pedidos', () => {
      const state = useOrderStore.getState();
      expect(state.orders).toHaveLength(0);
    });

    it('debe poder establecer pedidos', () => {
      const mockOrders = [
        {
          id: '1',
          company_id: 'test-company-id',
          customer_name: 'Cliente 1',
          total_amount: 0,
          advance_payment: 0,
          status: 'PENDING',
          due_date: '2026-12-31',
          business_unit: 'RAICES',
          items: [],
          created_at: new Date().toISOString(),
        },
      ];

      useOrderStore.setState({ orders: mockOrders });
      const state = useOrderStore.getState();
      expect(state.orders).toHaveLength(1);
      expect(state.orders[0].id).toBe('1');
      expect(state.orders[0].customer_name).toBe('Cliente 1');
    });

    it('debe poder obtener el modo de vista actual', () => {
      const state = useOrderStore.getState();
      expect(state.viewMode).toBe('list');
      useOrderStore.setState({ viewMode: 'kanban' });
      expect(useOrderStore.getState().viewMode).toBe('kanban');
      useOrderStore.setState({ viewMode: 'calendar' });
      expect(useOrderStore.getState().viewMode).toBe('calendar');
    });

    it('debe manejar selección de pedidos correctamente', () => {
      const order1 = {
        id: '1',
        company_id: 'test-company-id',
        customer_name: 'Cliente 1',
        total_amount: 0,
        advance_payment: 0,
        status: 'PENDING',
        due_date: '2026-12-31',
        business_unit: 'RAICES',
        items: [],
        created_at: new Date().toISOString(),
      };

      const order2 = {
        id: '2',
        company_id: 'test-company-id',
        customer_name: 'Cliente 2',
        total_amount: 0,
        advance_payment: 0,
        status: 'PENDING',
        due_date: '2026-12-31',
        business_unit: 'GENERAL',
        items: [],
        created_at: new Date().toISOString(),
      };

      useOrderStore.setState({ orders: [order1, order2] });

      // Seleccionar primer pedido
      useOrderStore.getState().toggleOrderSelection('1');
      expect(useOrderStore.getState().selectedOrders.has('1')).toBe(true);
      expect(useOrderStore.getState().selectedOrders.has('2')).toBe(false);

      // Seleccionar segundo pedido
      useOrderStore.getState().toggleOrderSelection('2');
      expect(useOrderStore.getState().selectedOrders.has('1')).toBe(true);
      expect(useOrderStore.getState().selectedOrders.has('2')).toBe(true);

      // Deseleccionar primer pedido
      useOrderStore.getState().toggleOrderSelection('1');
      expect(useOrderStore.getState().selectedOrders.has('1')).toBe(false);
      expect(useOrderStore.getState().selectedOrders.has('2')).toBe(true);

      // Seleccionar todos
      useOrderStore.getState().selectAllOrders(['1', '2']);
      expect(useOrderStore.getState().selectedOrders.has('1')).toBe(true);
      expect(useOrderStore.getState().selectedOrders.has('2')).toBe(true);

      // Limpiar selección
      useOrderStore.getState().clearSelection();
      expect(useOrderStore.getState().selectedOrders.size).toBe(0);
    });
  });

  describe('Estado de carga y errores', () => {
    it('debe poder establecer y limpiar estados de loading', () => {
      useOrderStore.setState({ isLoading: true });
      expect(useOrderStore.getState().isLoading).toBe(true);

      useOrderStore.setState({ isLoading: false });
      expect(useOrderStore.getState().isLoading).toBe(false);
    });

    it('debe poder establecer y limpiar estados de error', () => {
      const testError = new Error('Error de prueba');
      useOrderStore.setState({ error: testError });
      expect(useOrderStore.getState().error).toBe(testError);

      useOrderStore.setState({ error: null });
      expect(useOrderStore.getState().error).toBeNull();
    });
  });

  describe('Plantillas', () => {
    it('debe cargar plantillas desde localStorage al inicializarse', () => {
      // Las plantillas se cargan en la inicialización del store
      const state = useOrderStore.getState();
      expect(Array.isArray(state.templates)).toBe(true);
    });

    it('debe poder guardar y eliminar plantillas', () => {
      const state = useOrderStore.getState();
      const initialTemplateCount = state.templates.length;

      const mockOrder = {
        id: 'order-1',
        company_id: 'test-company-id',
        customer_name: 'Cliente Test',
        total_amount: 100,
        advance_payment: 50,
        status: 'PENDING',
        due_date: '2026-12-31',
        business_unit: 'RAICES',
        items: [],
        created_at: new Date().toISOString(),
      };

      // Guardar plantilla
      useOrderStore.getState().saveTemplate('Plantilla Test', mockOrder);
      const updatedState = useOrderStore.getState();
      expect(updatedState.templates).toHaveLength(initialTemplateCount + 1);
      expect(updatedState.templates[initialTemplateCount].name).toBe('Plantilla Test');

      // Eliminar plantilla
      const templateIdToDelete = updatedState.templates[initialTemplateCount].id;
      useOrderStore.getState().deleteTemplate(templateIdToDelete);
      const finalState = useOrderStore.getState();
      expect(finalState.templates).toHaveLength(initialTemplateCount);
    });
  });
});