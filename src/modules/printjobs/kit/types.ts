export interface KitComponent { id: string; name: string; quantityPerKit: number; completed: number; status?: 'pendiente'|'parcial'|'listo'; unit?: string; }
export interface KitJob { id: string; name: string; isKit: boolean; components: KitComponent[]; }
