import { useState } from 'react';
import type { KitComponent } from './types';

export function KitProgressBadge({ components }: { components: KitComponent[] }) {
  const safe = (components || []).filter(c => c && typeof c.completed === 'number' && typeof c.quantityPerKit === 'number' && c.quantityPerKit > 0);
  const minReady = safe.length ? Math.min(...safe.map(c => Math.round((c.completed / c.quantityPerKit) * 100))) : 100;
  const kitsReady = Math.max(0, Math.floor(minReady / 100));
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-400/30">
      {kitsReady} kit(s) listo(s)
    </span>
  );
}
