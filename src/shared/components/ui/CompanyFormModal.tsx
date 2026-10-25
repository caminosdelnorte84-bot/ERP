import { useState, useEffect, useRef, memo, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Building2, MapPin, Phone, Globe, FileText, Hash, Save, X, Trash2, Boxes } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../shared/types/database.types';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (company: { id: string; name: string }) => void;
  onDeleted?: (companyId: string) => void;
  editCompany?: CompanyRow | null;
}

const FISCAL_OPTIONS = [
  { value: 'RI', label: 'Responsable Inscripto' },
  { value: 'MONOTRIBUTO', label: 'Monotributo' },
  { value: 'EXENTO', label: 'Exento' },
  { value: 'CF', label: 'Consumidor Final' },
];

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

const ALL_MODULE_CODES = ['orders','quotes','catalog','sublimation','printjobs','mockups','crm','inventory','finance'];

const AVAILABLE_MODULES = [
  { code: 'orders', label: 'Pedidos', description: 'Gestión de pedidos de clientes' },
  { code: 'quotes', label: 'Presupuestos B2B', description: 'Cotizaciones y presupuestos' },
  { code: 'catalog', label: 'Catálogo', description: 'Catálogo de productos' },
  { code: 'sublimation', label: 'Sublimación y Textil', description: 'Repositorio de sublimación y blanks' },
  { code: 'printjobs', label: 'Impresión 3D', description: 'Repositorio 3D y filamentos' },
  { code: 'mockups', label: 'Mockups Base', description: 'Mockups y visualizaciones' },
  { code: 'crm', label: 'CRM / Directorio', description: 'Clientes y cuentas corrientes' },
  { code: 'inventory', label: 'Stock y Compras', description: 'Inventario, insumos y proveedores' },
  { code: 'finance', label: 'Finanzas y Tesorería', description: 'Tesorería, finanzas y rentabilidad' },
];

const initialState = {
  name: '',
  commercial_name: '',
  tax_id: '',
  fiscal_condition: 'RI',
  phone: '',
  email: '',
  website: '',
  address: '',
  city: '',
  province: 'Buenos Aires',
  postal_code: '',
  notes: '',
};

export const CompanyFormModal = memo(({ isOpen, onClose, onSaved, onDeleted, editCompany }: CompanyFormModalProps) => {
  const [form, setForm] = useState(initialState);
  const [selectedModules, setSelectedModules] = useState<string[]>(ALL_MODULE_CODES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'fiscal' | 'location' | 'contact' | 'modules'>('general');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editCompany) {
        setForm({
          name: editCompany.name || '',
          commercial_name: editCompany.commercial_name || '',
          tax_id: editCompany.tax_id || '',
          fiscal_condition: editCompany.fiscal_condition || 'RI',
          phone: editCompany.phone || '',
          email: editCompany.email || '',
          website: editCompany.website || '',
          address: editCompany.address || '',
          city: editCompany.city || '',
          province: editCompany.province || 'Buenos Aires',
          postal_code: editCompany.postal_code || '',
          notes: editCompany.notes || '',
        });
        // Fetch enabled modules
        (supabase as any)
          .from('company_modules')
          .select('module_code')
          .eq('company_id', editCompany.id)
          .eq('enabled', true)
          .then(({ data }: any) => {
            if (data && data.length > 0) {
              setSelectedModules(data.map((d: any) => d.module_code));
            } else {
              setSelectedModules(ALL_MODULE_CODES);
            }
          });
      } else {
        setForm(initialState);
        setSelectedModules(ALL_MODULE_CODES);
      }
      requestAnimationFrame(() => nameRef.current?.focus());
    }
  }, [isOpen, editCompany]);

  const update = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setIsSubmitting(true);
    try {
      let targetCompanyId = '';
      if (editCompany) {
        const payload: CompanyUpdate = {
          name: form.name.trim().toUpperCase(),
          commercial_name: form.commercial_name.trim() || null,
          tax_id: form.tax_id.trim() || null,
          fiscal_condition: form.fiscal_condition,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          website: form.website.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          province: form.province || null,
          postal_code: form.postal_code.trim() || null,
          notes: form.notes.trim() || null,
        };
        const { error } = await supabase.from('companies').update(payload).eq('id', editCompany.id);
        if (error) throw error;
        targetCompanyId = editCompany.id;
        onSaved({ id: editCompany.id, name: form.name.trim().toUpperCase() });
      } else {
        const payload: CompanyInsert = {
          name: form.name.trim().toUpperCase(),
          commercial_name: form.commercial_name.trim() || null,
          tax_id: form.tax_id.trim() || null,
          fiscal_condition: form.fiscal_condition,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          website: form.website.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          province: form.province || null,
          postal_code: form.postal_code.trim() || null,
          notes: form.notes.trim() || null,
        };
        const { data, error } = await supabase.from('companies').insert([payload]).select('id, name').single();
        if (error) throw error;
        targetCompanyId = data!.id;
        onSaved(data!);
      }

      // Save module settings
      const moduleRows = ALL_MODULE_CODES.map((code) => ({
        company_id: targetCompanyId,
        module_code: code,
        enabled: selectedModules.includes(code),
        updated_at: new Date().toISOString(),
      }));
      await (supabase as any).from('company_modules').upsert(moduleRows, { onConflict: 'company_id,module_code' });

      Swal.fire({
        icon: 'success',
        title: editCompany ? 'Empresa actualizada' : 'Empresa creada',
        timer: 1500,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#fff',
      });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'No se pudo guardar la empresa',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, editCompany, selectedModules, onSaved, onClose]);

  const handleDelete = useCallback(async () => {
    if (!editCompany) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la empresa "${editCompany.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      background: '#0f172a',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('companies').delete().eq('id', editCompany.id);
      if (error) throw error;

      if (onDeleted) {
        onDeleted(editCompany.id);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Empresa eliminada',
        timer: 1500,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#fff',
      });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'No se pudo eliminar la empresa',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [editCompany, onDeleted, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Building2 },
    { id: 'fiscal' as const, label: 'Fiscal', icon: FileText },
    { id: 'location' as const, label: 'Ubicación', icon: MapPin },
    { id: 'contact' as const, label: 'Contacto', icon: Phone },
    { id: 'modules' as const, label: 'Módulos', icon: Boxes },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black uppercase italic dark:text-white">
                {editCompany ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {editCompany ? 'Modifica los datos de la empresa' : 'Configura los datos legales y fiscales'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <div>
                <label htmlFor="company-name" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Razón Social *
                </label>
                <input
                  id="company-name"
                  ref={nameRef}
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="EJ: RAICES DISEÑOS S.R.L."
                  required
                />
              </div>
              <div>
                <label htmlFor="company-commercial" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Nombre Comercial
                </label>
                <input
                  id="company-commercial"
                  value={form.commercial_name}
                  onChange={(e) => update('commercial_name', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="EJ: Raíces Brand"
                />
              </div>
              <div>
                <label htmlFor="company-notes" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Notas Internas
                </label>
                <textarea
                  id="company-notes"
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={3}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Información adicional sobre la empresa..."
                />
              </div>
            </>
          )}

          {/* Fiscal Tab */}
          {activeTab === 'fiscal' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company-tax" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    CUIT / ID Tributario
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="company-tax"
                      value={form.tax_id}
                      onChange={(e) => update('tax_id', e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                      placeholder="30-12345678-9"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="company-iva" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Condición ante IVA
                  </label>
                  <select
                    id="company-iva"
                    value={form.fiscal_condition}
                    onChange={(e) => update('fiscal_condition', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white font-bold"
                  >
                    {FISCAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  Condición fiscal: {FISCAL_OPTIONS.find((o) => o.value === form.fiscal_condition)?.label}
                </p>
                <p className="text-[9px] text-blue-500/70 mt-1">
                  {form.fiscal_condition === 'RI' && 'Responsable Inscripto: IVA débito fiscal y crédito fiscal.'}
                  {form.fiscal_condition === 'MONOTRIBUTO' && 'Monotributo: cuota fija mensual, sin IVA.'}
                  {form.fiscal_condition === 'EXENTO' && 'Exento: no genera ni admite IVA.'}
                  {form.fiscal_condition === 'CF' && 'Consumidor Final: sin facturación fiscal.'}
                </p>
              </div>
            </>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Dirección
                </label>
                <input
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Av. Corrientes 1234, Piso 5"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Ciudad
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="CABA"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Provincia
                  </label>
                  <select
                    value={form.province}
                    onChange={(e) => update('province', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white font-bold text-sm"
                  >
                    {PROVINCIAS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Cód. Postal
                  </label>
                  <input
                    value={form.postal_code}
                    onChange={(e) => update('postal_code', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="C1043"
                  />
                </div>
              </div>
            </>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="info@raices.com.ar"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Sitio Web
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.raices.com.ar"
                  />
                </div>
              </div>
            </>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Selecciona los módulos activos para esta empresa:
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedModules(ALL_MODULE_CODES)}
                    className="text-[10px] font-bold text-blue-500 hover:underline uppercase"
                  >
                    Marcar todos
                  </button>
                  <span className="text-slate-400">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedModules([])}
                    className="text-[10px] font-bold text-slate-400 hover:underline uppercase"
                  >
                    Desmarcar todos
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_MODULES.map((mod) => {
                  const isChecked = selectedModules.includes(mod.code);
                  return (
                    <label
                      key={mod.code}
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-500/50 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModules((prev) => [...prev, mod.code]);
                          } else {
                            setSelectedModules((prev) => prev.filter((c) => c !== mod.code));
                          }
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-bold">{mod.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{mod.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-8 pt-0 flex gap-3">
          {editCompany && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white px-5 py-5 rounded-2xl font-black uppercase tracking-widest border border-rose-500/30 transition-colors disabled:opacity-50"
              title="Eliminar empresa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.name.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-colors transition-transform disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Guardando...' : editCompany ? 'Actualizar Empresa' : 'Crear Empresa'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
});

CompanyFormModal.displayName = 'CompanyFormModal';
