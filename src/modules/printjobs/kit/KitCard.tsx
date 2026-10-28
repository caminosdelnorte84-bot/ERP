import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { KitJob, KitComponent } from './types';
import { KitProgressBadge } from './KitProgressBadge';
import { KitComponentRow } from './KitComponentRow';

export function KitCard({ job }: { job: KitJob }) {
  const [expanded, setExpanded] = useState(false);
  const comps = job.components || [];
  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 focus:outline-none"
        aria-expanded={expanded}
        role="button"
        tabIndex={0}
      >
        <div>
          <div className="font-bold text-slate-100">{job.name}</div>
          <div className="text-xs text-slate-400">KIT · {comps.length} piezas</div>
        </div>
        <div className="flex items-center gap-2">
          <KitProgressBadge components={comps as KitComponent[]} />
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-slate-700/30" role="region" aria-label="Componentes del kit">
          {comps.map((c) => <KitComponentRow key={c.id} comp={c as KitComponent} />)}
        </div>
      )}
    </div>
  );
}
