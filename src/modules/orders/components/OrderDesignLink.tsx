import { useEffect, useState, useRef } from 'react';
import { ScanSearch, ShieldAlert, ImageOff, Plus, Upload, X } from 'lucide-react';
import { useSublimationStore } from '../../sublimation/store/useSublimationStore';
import { useTenantStore } from '../../../store/useTenantStore';
import { supabase } from '../../../lib/supabase';
import {
  PRODUCT_PRESETS,
  loadImageInfo,
  evaluatePreset,
  VERDICT_LABELS,
  type PreflightVerdict,
} from '../../sublimation/utils/printPreflight';

export interface OrderDesignMeta {
  designId: string | null;
  productName: string | null;
  verdict: PreflightVerdict | null;
  clientApproved: boolean;
}

interface OrderDesignLinkProps {
  value: OrderDesignMeta;
  onChange: (patch: Partial<OrderDesignMeta>) => void;
}

const INPUT_CLASS =
  'w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500';

/** Subir imagen a Supabase Storage y devolver la referencia guardada */
async function uploadDesignImage(
  companyId: string,
  file: File,
): Promise<{ ref: string; url: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${companyId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('designs')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('designs')
    .getPublicUrl(path);

  return { ref: path, url: urlData.publicUrl };
}

export const OrderDesignLink = ({ value, onChange }: OrderDesignLinkProps) => {
  const { designs, fetchDesigns, addDesign } = useSublimationStore();
  const companyId = useTenantStore((s) => s.activeCompanyId);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [dpiInfo, setDpiInfo] = useState<{ w: number; h: number; pxW: number; pxH: number } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!designs || designs.length === 0) void fetchDesigns();
  }, [designs, fetchDesigns]);

  // Focus trap and Escape key handling for modal
  useEffect(() => {
    if (!showCreateModal) return;

    const modal = modalContentRef.current;
    if (!modal) return;

    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll(focusableSelectors);
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Set initial focus to the first focusable element
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes the modal
      if (e.key === 'Escape') {
        setShowCreateModal(false);
        return;
      }

      // Tab key traps focus within modal
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab: if on first element, go to last
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab: if on last element, go to first
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCreateModal]);

  const selected = designs?.find((d) => d.id === value.designId) || null;

  useEffect(() => {
    let alive = false;
    const run = async () => {
      const src = selected?.imagen;
      const preset = value.productName
        ? PRODUCT_PRESETS.find((p) => p.label === value.productName) ?? null
        : null;
      if (!src || !preset) {
        setDpiInfo(null);
        setAnalysisError(null);
        return;
      }
      setAnalyzing(true);
      setAnalysisError(null);
      try {
        const info = await loadImageInfo(src);
        if (!alive) return;
        const r = evaluatePreset(info, preset);
        setDpiInfo({ pxW: info.widthPx, pxH: info.heightPx, w: r.effectiveDpiW, h: r.effectiveDpiH });
        onChange({ verdict: r.verdict });
      } catch (e) {
        if (!alive) return;
        setDpiInfo(null);
        setAnalysisError((e as Error).message);
      } finally {
        if (alive) setAnalyzing(false);
      }
    };
    alive = true;
    void run();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, value.productName]);

  const podLocked =
    designs?.some((d) => d.id === value.designId && d.pod_permitido === false) ?? false;

  const licenseUnknown = !!selected && selected.pod_permitido !== true;

  const handleDesignChange = (id: string) => {
    onChange({
      designId: id || null,
      productName: id ? value.productName : null,
      verdict: null,
      clientApproved: false,
    });
    if (!id) {
      setDpiInfo(null);
      setAnalysisError(null);
    }
  };

  const handleProductChange = (label: string) => {
    onChange({ ...value, productName: label || null, verdict: null });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCreateFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCreatePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async () => {
    if (!createName.trim()) return;
    if (!companyId) return;
    if (!createFile) return;

    setIsUploading(true);
    try {
      const { ref, url } = await uploadDesignImage(companyId, createFile);
      const newDesign = await addDesign({
        name: createName.trim(),
        category: 'Manual',
        status: 'Nuevo',
        platform: null,
        url_original: null,
        link_descarga: null,
        imagen: url,
        file_format: createFile.type.includes('svg') ? 'SVG' : 'PNG',
        background: 'Con fondo',
        pod_permitido: true,
        description: `Creado manualmente desde pedido (${new Date().toLocaleDateString('es-AR')})`,
      });

      onChange({ designId: newDesign.id, productName: null, verdict: null, clientApproved: false });
      setCreateName('');
      setCreateFile(null);
      setCreatePreview(null);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creando diseño:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        className={`rounded-3xl p-6 space-y-4 border transition-colors ${
          podLocked
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
            : 'bg-violet-50 dark:bg-violet-950/10 border-violet-100 dark:border-violet-900/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
            <span aria-hidden>🎨</span> Diseño a Producir
          </h3>
          <div className="flex items-center gap-2">
            {analyzing && (
              <span className="text-[10px] font-black text-slate-400 animate-pulse uppercase">
                Analizando...
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[9px] font-black uppercase transition-colors"
            >
              <Plus className="w-3 h-3" />
              Nuevo diseño
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={value.designId || ''}
            onChange={(e) => handleDesignChange(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Sin diseño del repositorio</option>
            {(designs || [])
              .filter((d) => d.pod_permitido !== false)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                  {d.pod_permitido ? ' ✅' : ''}
                </option>
              ))}
          </select>
          <select
            value={value.productName || ''}
            onChange={(e) => handleProductChange(e.target.value)}
            disabled={!value.designId}
            className={`${INPUT_CLASS} disabled:opacity-40`}
          >
            <option value="">Producto destino...</option>
            {PRODUCT_PRESETS.map((p) => (
              <option key={p.id} value={p.label}>
                {p.label} ({p.widthCm}×{p.heightCm} cm)
              </option>
            ))}
          </select>
        </div>

        {podLocked && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30 border border-rose-300">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
            <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
              Este diseño tiene licencia Personal y NO puede venderse impreso (candado POD).
            </p>
          </div>
        )}

        {licenseUnknown && !podLocked && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              Licencia sin confirmar para venta. Confirmala en el repositorio antes de producir.
            </p>
          </div>
        )}

        {analysisError && (
          <p className="flex items-center gap-2 text-[11px] font-bold text-rose-500">
            <ImageOff className="w-3.5 h-3.5" /> {analysisError}
          </p>
        )}

        {value.designId && !value.productName && (
          <p className="text-[11px] font-bold text-slate-400">
            Elegí el producto destino para verificar la calidad de impresión.
          </p>
        )}

        {dpiInfo && dpiInfo.w > 0 && value.productName && (
          <div
            className={`flex items-center justify-between gap-3 p-4 rounded-2xl border ${
              value.verdict
                ? VERDICT_LABELS[value.verdict].className
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Preflight · {dpiInfo.pxW}×{dpiInfo.pxH} px
              </p>
              <p className="font-black text-sm">
                {value.verdict ? VERDICT_LABELS[value.verdict].label : '—'} ·{' '}
                {dpiInfo.w}×{dpiInfo.h} DPI efectivos
              </p>
            </div>
            <ScanSearch className="w-5 h-5 shrink-0 opacity-40" />
          </div>
        )}

        {value.verdict === 'bad' && (
          <label className="flex items-start gap-3 cursor-pointer select-none p-4 rounded-2xl bg-rose-100 dark:bg-rose-900/30 border-2 border-dashed border-rose-400">
            <input
              type="checkbox"
              checked={value.clientApproved}
              onChange={(e) => onChange({ ...value, clientApproved: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-rose-600 shrink-0"
            />
            <span className="text-[11px] font-black uppercase tracking-wide text-rose-700 dark:text-rose-300">
              El diseño va a salir pixelado a este tamaño. El cliente vio la advertencia y aprobó
              imprimir de todos modos.
            </span>
          </label>
        )}
      </div>

      {/* Crear nuevo diseño modal */}
      {showCreateModal && (
        <div ref={modalContentRef} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white" role="heading" aria-level="2">
                Crear nuevo diseño
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 block mb-1">
                  Nombre del diseño *
                </label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Ej: Logo cliente - Remera espalda"
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-violet-500"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 block mb-1">
                  Imagen *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-violet-400 transition-colors"
                >
                  {createPreview ? (
                    <>
                      <img
                        src={createPreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-xl mb-2"
                      />
                      <p className="text-[10px] text-slate-400 font-bold">Cambiar imagen</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-500">
                        Click para subir imagen
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1">PNG, JPG, SVG</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={!createName.trim() || !createFile || isUploading}
                className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-black text-xs uppercase tracking-widest shadow-lg disabled:shadow-none transition-colors"
              >
                {isUploading ? 'Guardando...' : 'Guardar diseño'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
