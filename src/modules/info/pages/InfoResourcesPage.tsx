import { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Plus, Trash2, Flame, type LucideIcon } from 'lucide-react';
import { useTenantStore } from '../../../store/useTenantStore';
import { useToastStore } from '../../../store/useToastStore';
import { Modal, FormField } from '../../../shared/components/ui/Modal';

interface InfoItem {
  readonly id?: string;
  readonly label: string;
  readonly valor?: string;
  readonly link?: string;
  readonly nota?: string;
  readonly isCustom?: boolean;
}

interface InfoSeccion {
  readonly id: string;
  readonly titulo: string;
  readonly icono: LucideIcon;
  readonly items: InfoItem[];
}

const DEFAULT_SECCIONES: InfoSeccion[] = [
  {
    id: 'sublimacion',
    titulo: 'Parámetros y Experiencia de Sublimación',
    icono: Flame,
    items: [
      { label: 'Tazas de cerámica', valor: '180°C / 180 segundos', nota: 'Presión media-alta. Esperar a que enfríe antes de retirar la cinta térmica.' },
      { label: 'Polímero / Plástico', valor: '180°C / 120 segundos', nota: 'Cuidado con el exceso de temperatura para no deformar el polímero.' },
      { label: 'Notas de experiencia general', valor: 'PLA (190-210°C) / PETG (230-240°C)', nota: 'Usar laca en la cama fría para PETG si hay poca adherencia. Mantener filamentos en caja seca.' },
    ],
  },
  {
    id: 'contactos',
    titulo: 'Contactos útiles',
    icono: BookOpen,
    items: [
      { label: 'Contadora', valor: 'Nombre — teléfono / email', nota: 'Facturación y liquidaciones' },
      { label: 'Imprenta / serigrafía externa', valor: 'Nombre — teléfono', nota: 'Trabajos que no hacemos en casa' },
      { label: 'Mensajería / envíos', valor: 'OCA, Andreani, etc.', nota: 'Tarifas y cortes diarios' },
    ],
  },
  {
    id: 'links',
    titulo: 'Links y herramientas',
    icono: ExternalLink,
    items: [
      { label: 'Mercado Libre', link: 'https://www.mercadolibre.com.ar', nota: 'Publicaciones y mensajes' },
      { label: 'Creative Fabrica', link: 'https://www.creativefabrica.com', nota: 'Diseños con licencia PoD' },
      { label: 'Etsy', link: 'https://www.etsy.com', nota: 'Tienda internacional' },
      { label: 'Google Drive', link: 'https://drive.google.com', nota: 'Archivos maestros y mockups' },
    ],
  },
  {
    id: 'procedimientos',
    titulo: 'Procedimientos',
    icono: BookOpen,
    items: [
      { label: 'Cómo se cotiza un pedido B2B', nota: 'Usar Presupuestos B2B → enviar por WhatsApp → si aprueba, crear Pedido.' },
      { label: 'Cómo se sube un diseño al repositorio', nota: 'Repositorio Sublimación → Nuevo Diseño → subir imagen → fijar DPI y licencia PoD.' },
      { label: 'Entrega parcial de un pedido', nota: 'Pedidos → detalle → Registrar Entrega → elegir variantes y cantidades.' },
    ],
  },
  {
    id: 'referencia',
    titulo: 'Datos de referencia',
    icono: BookOpen,
    items: [
      { label: 'Horarios del taller', valor: 'Lun a Vie 9–18 h, Sáb 9–13 h' },
      { label: 'Dirección', valor: 'Completar dirección del taller' },
      { label: 'Corte de pedidos para entrega', valor: 'Completar (ej: pedidos hasta las 14 h se entregan al día siguiente)' },
    ],
  },
];

export const InfoResourcesPage = () => {
  const activeCompanyId = useTenantStore((s) => s.activeCompanyId);
  const toast = useToastStore((s) => s.toast);

  const [secciones, setSecciones] = useState<InfoSeccion[]>(() => {
    if (!activeCompanyId) return DEFAULT_SECCIONES;
    try {
      const saved = localStorage.getItem(`epr_info_secciones_${activeCompanyId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SECCIONES;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ secId: DEFAULT_SECCIONES[0].id, label: '', valor: '', link: '', nota: '' });

  useEffect(() => {
    if (!activeCompanyId) return;
    try {
      const saved = localStorage.getItem(`epr_info_secciones_${activeCompanyId}`);
      if (saved) {
        setSecciones(JSON.parse(saved));
      } else {
        setSecciones(DEFAULT_SECCIONES);
      }
    } catch {
      setSecciones(DEFAULT_SECCIONES);
    }
  }, [activeCompanyId]);

  const saveSecciones = (next: InfoSeccion[]) => {
    setSecciones(next);
    if (activeCompanyId) {
      try {
        localStorage.setItem(`epr_info_secciones_${activeCompanyId}`, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveNote = () => {
    if (!formData.label) {
      toast('El título es obligatorio', { type: 'error' });
      return;
    }

    const newItem: InfoItem = {
      id: `custom-${Date.now()}`,
      label: formData.label,
      valor: formData.valor || undefined,
      link: formData.link || undefined,
      nota: formData.nota || undefined,
      isCustom: true,
    };

    const updated = secciones.map((sec) => {
      if (sec.id === formData.secId) {
        return {
          ...sec,
          items: [newItem, ...sec.items],
        };
      }
      return sec;
    });

    saveSecciones(updated);
    toast('Nota agregada al repositorio', { type: 'success' });
    setIsModalOpen(false);
    setFormData({ secId: DEFAULT_SECCIONES[0].id, label: '', valor: '', link: '', nota: '' });
  };

  const handleDeleteItem = (secId: string, itemId?: string) => {
    if (!itemId) return;
    const updated = secciones.map((sec) => {
      if (sec.id === secId) {
        return {
          ...sec,
          items: sec.items.filter((item) => item.id !== itemId),
        };
      }
      return sec;
    });
    saveSecciones(updated);
    toast('Nota eliminada', { type: 'info' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/30 shrink-0">
            <BookOpen size={28} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
              Repositorio de Información
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Parámetros de sublimación, notas de experiencia, contactos y procedimientos del taller.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-600/25 transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Agregar Nota o Dato
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Nota o Dato" onSubmit={handleSaveNote} submitLabel="Guardar Nota">
        <FormField label="Sección">
          <select
            value={formData.secId}
            onChange={(e) => setFormData(prev => ({...prev, secId: e.target.value}))}
            className="w-full bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
          >
            {DEFAULT_SECCIONES.map((s) => <option key={s.id} value={s.id}>{s.titulo}</option>)}
          </select>
        </FormField>
        <FormField label="Título / Concepto">
          <input
            value={formData.label}
            onChange={(e) => setFormData(prev => ({...prev, label: e.target.value}))}
            placeholder="Ej: Temperatura remeras algodón"
            className="w-full bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
          />
        </FormField>
        <div className="flex gap-4">
          <FormField label="Valor / Parámetro">
            <input
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({...prev, valor: e.target.value}))}
              placeholder="190°C / 50 seg"
              className="w-full bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </FormField>
          <FormField label="Link (Opcional)">
            <input
              value={formData.link}
              onChange={(e) => setFormData(prev => ({...prev, link: e.target.value}))}
              placeholder="https://..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </FormField>
        </div>
        <FormField label="Notas de experiencia / Detalle">
          <textarea
            value={formData.nota}
            onChange={(e) => setFormData(prev => ({...prev, nota: e.target.value}))}
            placeholder="Consejos técnicos, precauciones..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 h-32"
          />
        </FormField>
      </Modal>

      {/* SECCIONES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {secciones.map((seccion) => {
          const Icon = seccion.icono;
          return (
            <section
              key={seccion.id}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              aria-label={seccion.titulo}
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-2xl">
                    <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                    {seccion.titulo}
                  </h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full uppercase tracking-wider">
                  {seccion.items.length} {seccion.items.length === 1 ? 'ítem' : 'ítems'}
                </span>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {seccion.items.map((item, idx) => (
                  <li key={item.id ?? `${seccion.id}-${idx}`} className="px-8 py-6 group relative hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-2 flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-900 dark:text-white leading-snug">{item.label}</p>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                          >
                            {item.link}
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                        {item.valor && (
                          <p className="text-sm font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 rounded-xl inline-block">
                            {item.valor}
                          </p>
                        )}
                        {item.nota && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed mt-1">
                            {item.nota}
                          </p>
                        )}
                      </div>
                      {item.isCustom && item.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(seccion.id, item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Eliminar nota"
                        >
                          <Trash2 className="w-5 h-5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold text-center pt-4">
        Las notas agregadas se guardan de forma persistente para el entorno de trabajo actual.
      </p>
    </div>
  );
};

