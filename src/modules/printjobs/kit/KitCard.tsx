import React, { useState } from 'react';
import { PackageOpen, Box, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { KitComponent, KitJob } from './types';
import { KitComponentRow } from './KitComponentRow';

interface KitCardProps {
  job: KitJob;
  onUpdateComponent: (componentId: string, completed: number) => void;
}

export const KitCard = React.memo(function KitCard({ job, onUpdateComponent }: KitCardProps) {
  const components = job.components ?? [];
  const [expanded, setExpanded] = useState(components.length > 0);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const readyCount = components.filter((c) => c.completed >= c.quantityPerKit).length;
  const minReady = components.length > 0
    ? Math.min(...components.map((c) => Math.floor((c.completed / Math.max(1, c.quantityPerKit)) * 100)))
    : 100;

  const kitsReady = components.length > 0
    ? Math.floor(minReady / 100)
    : 0;

  const allDone = components.length > 0 && readyCount === components.length;

  return (
    <div
      role="region"
      aria-label={`Kit ${job.name}`}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden"
    >
      {/* Header del kit */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded((v) => !v)}
        className="flex items-center justify-between gap-3 p-3.5 bg-slate-800/70 hover:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-slate-400" aria-hidden="true">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
          <span className="text-slate-400" aria-hidden="true">
            <Box size={16} className="text-indigo-300" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">{job.name}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Kit · {components.length} pieza{components.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase flex items-center gap-1.5 ${
              allDone
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : readyCount > 0
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
            }`}
          >
            {allDone ? <CheckCircle2 size={10} aria-hidden /> : <PackageOpen size={10} aria-hidden />}
            {kitsReady} kit{kitsReady === 1 ? '' : 's'} listo{kitsReady === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Cuerpo expandible con componentes */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          expanded ? 'max-h-[60vh]' : 'max-h-0'
        }`}
        aria-hidden={!expanded}
      >
        <div className="p-3 space-y-2 bg-slate-900">
          {components.map((c) => (
            <KitComponentRow
              key={c.id}
              component={c}
              isOpen={!!openRows[c.id]}
              onToggle={() => toggleRow(c.id)}
              onUpdateComponent={onUpdateComponent}
            />
          ))}
        </div>
      </div>
    </div>
  );
});