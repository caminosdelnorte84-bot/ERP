/* eslint-disable */
// @ts-nocheck
// Paso 4a — selector módulos habilitados por empresa (es-AR)
export default function ModuleSelector({ enabled = [], onChange }: { enabled: string[]; onChange: (c: string[]) => void }) {
  const MODULES = [
    { code: 'orders', label: 'Pedidos' },
    { code: 'quotes', label: 'Cotizaciones' },
    { code: 'catalog', label: 'Catálogo' },
    { code: 'sublimation', label: 'Sublimación / Diseños' },
    { code: 'printjobs', label: 'Impresión 3D' },
    { code: 'mockups', label: 'Mockups' },
    { code: 'crm', label: 'Clientes (CRM)' },
    { code: 'inventory', label: 'Stock / Filamentos' },
    { code: 'finance', label: 'Finanzas / Tesorería' },
  ];
  const toggle = (code: string) => onChange(enabled.includes(code) ? enabled.filter(c => c !== code) : [...enabled, code]);
  return (
    <div className="grid grid-cols-2 gap-2">
      {MODULES.map(m => (
        <button key={m.code} onClick={() => toggle(m.code)} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-slate-100" aria-pressed={enabled.includes(m.code)}>
          {enabled.includes(m.code) ? '☑' : '☐'} <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
