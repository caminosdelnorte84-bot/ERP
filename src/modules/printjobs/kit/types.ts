/** Tipos UI para kits multi-pieza (solo capa de presentación; sin backend). */
export interface KitComponent {
  id: string;
  name: string;
  /** Cantidad de esta pieza necesaria por cada kit/armado. */
  quantityPerKit: number;
  /** Cantidad ya completada/impresa del componente. */
  completed: number;
  /** Unidad de medida opcional (ej. "pieza", "bolsa"). */
  unit?: string;
  /** Estado del componente individual. */
  status?: 'pendiente' | 'parcial' | 'listo';
}

/** Un trabajo 3D interpretado como kit. */
export interface KitJob {
  id: string;
  name: string;
  isKit: boolean;
  /** Piezas que componen el kit. Si es null, el trabajo es pieza única. */
  components: KitComponent[] | null;
}