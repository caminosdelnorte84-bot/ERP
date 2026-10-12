import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInventoryStore } from './useInventoryStore';

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
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
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

describe('useInventoryStore', () => {
  beforeEach(() => {
    // Reinicializar el store antes de cada prueba
    useInventoryStore.setState({
      products: [],
      sizes: [],
      colors: [],
      isLoading: false,
    });

    // Limpiar mocks y localStorage
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Productos y Variantes', () => {
    it('debe inicializar con listas vacías', () => {
      const state = useInventoryStore.getState();
      expect(state.products).toHaveLength(0);
      expect(state.sizes).toHaveLength(0);
      expect(state.colors).toHaveLength(0);
    });

    it('debe poder establecer productos, tamaños y colores', () => {
      const mockProducts = [
        {
          id: 'prod-1',
          product_id: 'p-1',
          size_id: 's-1',
          color_id: 'c-1',
          stock_quantity: 10,
          base_quantity: 0,
          finished_quantity: 0,
          product_name: 'Camiseta Blanca',
          category: 'ROPA',
          size_name: 'Mediano',
          color_name: 'Blanco',
        },
      ];
      const mockSizes = [
        { id: 's-1', name: 'Mediano' },
        { id: 's-2', name: 'Grande' },
      ];
      const mockColors = [
        { id: 'c-1', name: 'Blanco', hex_code: '#FFFFFF' },
        { id: 'c-2', name: 'Negro', hex_code: '#000000' },
      ];

      useInventoryStore.setState({
        products: mockProducts,
        sizes: mockSizes,
        colors: mockColors
      });

      const state = useInventoryStore.getState();
      expect(state.products).toHaveLength(1);
      expect(state.products[0].product_name).toBe('Camiseta Blanca');
      expect(state.sizes).toHaveLength(2);
      expect(state.colors).toHaveLength(2);
    });

    it('debe poder obtener movimientos de stock', () => {
      // Simular algunos movimientos en localStorage
      const mockMovements = [
        {
          id: 'mov-1',
          product_id: 'p-1',
          variant_id: 'v-1',
          product_name: 'Producto Test',
          type: 'sale',
          quantity_change: -5,
          timestamp: Date.now() - 3600000, // hace 1 hora
          notes: 'Venta realizada',
        },
      ];
      localStorageMock.setItem('inventory_stock_movements', JSON.stringify(mockMovements));

      const movements = useInventoryStore.getState().getStockMovements();
      expect(movements).toHaveLength(1);
      expect(movements[0].id).toBe('mov-1');
      expect(movements[0].type).toBe('sale');
    });
  });

  describe('Operaciones de Stock', () => {
    it('debe registrar correctamente un movimiento de stock', () => {
      const movement = {
        product_id: 'p-1',
        variant_id: 'v-1',
        product_name: 'Producto Test',
        type: 'adjustment',
        quantity_change: 10,
        notes: 'Ajuste de inventario',
      };

      // Ejecutar la función que registra el movimiento
      useInventoryStore.getState().logStockMovement(movement);

      // Verificar que se guardó en localStorage
      const key = 'inventory_stock_movements';
      const existing: any[] = JSON.parse(localStorageMock.getItem(key) || '[]');
      expect(existing).toHaveLength(1);
      expect(existing[0].product_name).toBe('Producto Test');
      expect(existing[0].quantity_change).toBe(10);
    });

    it('debe mantener solo los últimos 200 movimientos de stock', () => {
      // Ejecutar logStockMovement 250 veces para activar el truncamiento
      for (let i = 0; i < 250; i++) {
        useInventoryStore.getState().logStockMovement({
          product_id: 'p-1',
          variant_id: `v-${i}`,
          product_name: `Producto ${i}`,
          type: 'adjustment',
          quantity_change: 1,
          notes: `Movimiento ${i}`,
        });
      }

      // Obtener los movimientos (should be trimmed to 200)
      const result = useInventoryStore.getState().getStockMovements();
      expect(result).toHaveLength(200);
      // El más reciente debería ser el primero (índice 0) - Movimiento 249
      expect(result[0].notes).toBe('Movimiento 249');
      // El más antiguo debería ser el último (índice 199) - Movimiento 50
      expect(result[199].notes).toBe('Movimiento 50');
    });
  });

  describe('Estado de carga y errores', () => {
    it('debe poder establecer y limpiar estados de loading', () => {
      useInventoryStore.setState({ isLoading: true });
      expect(useInventoryStore.getState().isLoading).toBe(true);

      useInventoryStore.setState({ isLoading: false });
      expect(useInventoryStore.getState().isLoading).toBe(false);
    });
  });
});