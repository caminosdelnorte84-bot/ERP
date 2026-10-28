import { useState } from 'react';
import { Plus, Trash2, Printer, Check } from 'lucide-react';

export interface RecountItem {
  id: string;
  name: string;
  total: number;
  printed: number;
  color: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: RecountItem[]) => void;
  filamentOptions?: string[];
}

let idCounter = 0;

export function ProductionRecountModal({ open, onClose, onConfirm, filamentOptions = ['PLA Negro', 'PLA Blanco', 'PETG', 'ABS'] }: Props) {
  const [items, setItems] = useState<RecountItem[]>([
    { id: 'r-1', name: 'Ficha Tetris', total: 6, printed: 0, color: 'PLA Negro' },
  ]);
  const [separate, setSeparate] = useState(true);

  const addItem = () => {
    setItems([...items, { id: `r-${++idCounter}`, name: '', total: 1, printed: 0, color: filamentOptions[0] || '' }]);
  };

  const update = (id: string, patch: Partial<RecountItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const remove = (id: string) => setItems(items.filter(i => i.id !== id));

  const handleConfirm = () => {
    onConfirm(items);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Recuento de producción">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Printer className="w-5 h-5 text-amber-400" />
          Recuento antes de producir
        </h2>

        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setSeparate(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${separate ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-600 text-slate-300'}`}
          >
            Sí — archivos separados
          </button>
          <button
            onClick={() => setSeparate(false)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${!separate ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-600 text-slate-300'}`}
          >
            No — conjunto único
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-3">Anotá cuantos vas imprimiendo por pieza:</p>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
          {items.map(it => (
            <div key={it.id} className="flex gap-2 items-center bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
              <input
                value={it.name}
                onChange={e => update(it.id, { name: e.target.value })}
                placeholder="Nombre pieza"
                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm w-32 focus:outline-none focus:border-amber-400"
              />
              <input
                type="number"
                value={it.total}
                min={1}
                onChange={e => update(it.id, { total: Math.max(1, Number(e.target.value)) })}
                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm w-20 text-right focus:outline-none focus:border-amber-400"
                title="Cantidad total a imprimir"
              />
              <input
                type="number"
                value={it.printed}
                min={0}
                max={it.total}
                onChange={e => update(it.id, { printed: Math.min(it.total, Math.max(0, Number(e.target.value))) })}
                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm w-20 text-right focus:outline-none focus:border-emerald-400"
                title="Cuántos ya imprimidos hoy"
              />
              <select
                value={it.color}
                onChange={e => update(it.id, { color: e.target.value })}
                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm w-28 focus:outline-none focus:border-amber-400"
              >
                {filamentOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => remove(it.id)} className="p-1 hover:text-rose-400 text-slate-400" aria-label="Eliminar pieza">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-500/25 border border-amber-400/30">
            <Plus className="w-4 h-4" /> Agregar pieza
          </button>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100">Cancelar</button>
          <button onClick={handleConfirm} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-emerald-500 text-slate-900 hover:bg-emerald-400">
            <Check className="w-4 h-4" /> Confirmar producción
          </button>
        </div>
      </div>
    </div>
  );
}
