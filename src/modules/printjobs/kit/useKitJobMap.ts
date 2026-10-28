/** Hook de presentación para mapear datos de ejemplo de kits. */
import { useMemo } from 'react';
import type { KitJob } from './types';
const EXAMPLE_KIT_JOBS: KitJob[] = [
  { id: 'kit-demo-01', name: 'Kit Base (demo)', isKit: true, components: [{ id: 'c-1', name: 'Tapa', quantityPerKit: 1, completed: 0, status: 'pendiente', unit: 'pz' }] },
];
export function useKitJobMap() {
  return useMemo(() => new Map<string, KitJob>(EXAMPLE_KIT_JOBS.map((k) => [k.id, k])), []);
}
