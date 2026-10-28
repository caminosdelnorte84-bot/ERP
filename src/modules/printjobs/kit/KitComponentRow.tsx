import React, { useCallback, useState } from 'react';
import { Check, ChevronDown, ChevronUp, PlaySquare, AlertTriangle } from 'lucide-react';
import type { KitComponent } from './types';

interface KitComponentRowProps {
  component: KitComponent;
  isOpen: boolean;
  onToggle: () => void;
  onUpdateComponent: (componentId: string, completed: number) => void;
}

export const KitComponentRow = React.memo(function KitComponentRow({
  component,
  isOpen,
  onToggle,
  onUpdateComponent,
}: KitComponentRowProps) {
  const [localCompleted, setLocalCompleted] = useState(component.completed);

  const percent = component.quantityPerKit > 0
    ? Math.min(100, Math.round((component.completed / component.quantityPerKit) * 100))
    : 0;

  const handleQuickCheck = useCallback(() => {
    const newCompleted = Math.min(component.quantityPerKit, component.completed + 1);
    setLocalCompleted(newCompleted);
    onUpdateComponent(component.id, newCompleted);
  }, [component.id, component.quantityPerKit, component.completed, onUpdateComponent]);

  const handleInputBlur = useCallback(() => {
    const val = parseInt(String(localCompleted), 10);
    const clamped = Math.max(0, Math.min(val, component.quantityPerKit));
    setLocalCompleted(clamped);
    onUpdateComponent(component.id, clamped);
  }, [component.id, localCompleted, component.quantityPerKit, onUpdateComponent]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalCompleted(parseInt(e.target.value, 10) || 0);
  }, []);

  const getStatusColor = () => {
    if (percent >= 100) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (percent > 0) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-slate-400 bg-slate-500/15 border-slate-500/30';
  };

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      {/* Header - always visible */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        className={`flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 hover:text-slate-200" aria-hidden="true">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
          <span className="text-sm font-bold text-white">{component.name}</span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {component.unit ? `${component.unit}` : 'pz'} × {component.quantityPerKit}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase ${getStatusColor()}`}>
            {percent}%
          </span>
        </div>
      </div>

      {/* Expandible content */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isOpen ? 'max-h-40' : 'max-h-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="p-3.5 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">
              Completadas
            </span>
            <input
              type="number"
              min={0}
              max={component.quantityPerKit}
              value={localCompleted}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm font-black text-white tabular-nums focus:border-orange-500 focus:outline-none"
              aria-label={`Completadas de ${component.name}`}
            />
            <span className="text-xs text-slate-400">/ {component.quantityPerKit}</span>

            <button
              onClick={handleQuickCheck}
              disabled={localCompleted >= component.quantityPerKit}
              title={localCompleted >= component.quantityPerKit ? 'Alcanzado' : `Marcar +1 (${component.name})`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${
                localCompleted >= component.quantityPerKit
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-emerald-200'
              }`}
              disabled={localCompleted >= component.quantityPerKit}
            >
              <Check size={12} />
              Check
            </button>
          </div>

          {/* Indicador visual de progreso */}
          <div className="mt-2.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percent >= 100
                  ? 'bg-emerald-500'
                  : percent > 0
                    ? 'bg-amber-400'
                    : 'bg-slate-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Estado crítico */}
          {percent === 0 && isOpen && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
              <AlertTriangle size={10} aria-hidden />
              <span>Falta producir esta pieza</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});