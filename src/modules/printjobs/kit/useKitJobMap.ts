/** Hook de presentación para mapear datos de ejemplo de kits. */
import { useMemo } from 'react';
import type { KitJob } from './types';

// Datos de ejemplo - SIMULACIÓN de kits sin tocar BD
const EXAMPLE_KIT_JOBS: KitJob[] = [
  {
    id: 'kit-demo-01',
    name: 'Kit Base de Impresión (3 piezas)',
    isKit: true,
    components: [
      { id: 'c-1', name: 'Tapa Superior', quantityPerKit: 1, completed: 1, status: 'listo', unit: 'pz' },
      { id: 'c-2', name: 'Base Inferior', quantityPerKit: 1, completed: 0, status: 'pendiente', unit: 'pz' },
      { id: 'c-3', name: 'Tornillos de montaje', quantityPerKit: 4, completed: 3, status: 'parcial', unit: 'pz' },
    ],
  },
  {
    id: 'kit-demo-02',
    name: 'Kit Kit de Decoración (2 piezas)',
    isKit: true,
    components: [
      { id: 'c-4', name: 'Sticker frontal', quantityPerKit: 2, completed: 2, status: 'listo', unit: 'pz' },
      { id: 'c-5', name: 'Soporte lateral', quantityPerKit: 2, completed: 1, status: 'parcial', unit: 'pz' },
    ],
  },
];

export function useKitJobMap() {
  return useMemo(() => new Map<string, KitJob>(EXAMPLE_KIT_JOBS.map((k) => [k.id, k])), []);
}
