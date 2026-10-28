import React from 'react';
import { Box, CheckCircle2, Hourglass, AlertTriangle } from 'lucide-react';
import type { KitComponent } from './types';

interface KitProgressBadgeProps {
  components: KitComponent[];
  className?: string;
}

/** Muestra "Juegos listos para armar" = mínimo de componentes disponibles. */
export const KitProgressBadge = React.memo(function KitProgressBadge({
  components,
  className,
}: KitProgressBadgeProps) {
  const safe = Math.max(1, components.length);
  const readyCount = components.filter((c) => c.completed >= c.quantityPerKit).length;
  const minReady = Math.min(
    ...components.map((c) => Math.floor((c.completed / Math.max(1, c.quantityPerKit)) * 100)),
  );
  const kitsReady = Math.floor(minReady / 100);

  let variant: 'success' | 'warning' | 'danger' = 'danger';
  let Icon = AlertTriangle;
  let label = `${kitsReady} kit${kitsReady === 1 ? '' : 's'} listo${kitsReady === 1 ? '' : 's'}`;

  if (kitsReady > 0) {
    variant = 'success';
    Icon = CheckCircle2;
  } else if (readyCount > 0) {
    variant = 'warning';
    Icon = Hourglass;
  }

  const styles: Record<typeof variant, string> = {
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${styles[variant]} ${className ?? ''}`}
      aria-label={`Juegos listos para armar: ${kitsReady}`}
    >
      <Icon size={11} aria-hidden="true" />
      <span className="flex items-center gap-1">
        <Box size={10} aria-hidden="true" /> {label}
      </span>
    </span>
  );
});