import type { KitComponent } from './types';

export function KitComponentRow({ comp }: { comp: KitComponent }) {
  const pct = comp.quantityPerKit > 0 ? Math.round((comp.completed / comp.quantityPerKit) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm py-1 border-b border-slate-700/30">
      <span className="w-32 truncate font-medium text-slate-200">{comp.name}</span>
      <span className="w-16 text-slate-400">{comp.completed}/{comp.quantityPerKit} {comp.unit || 'pz'}</span>
      <span className="text-xs font-bold text-emerald-300">{pct}%</span>
    </div>
  );
}
