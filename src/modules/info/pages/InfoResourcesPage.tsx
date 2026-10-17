import { BookOpen, ExternalLink, type LucideIcon } from 'lucide-react';

interface InfoItem {
  readonly label: string;
  readonly valor?: string;
  readonly link?: string;
  readonly nota?: string;
}

interface InfoSeccion {
  readonly titulo: string;
  readonly icono: LucideIcon;
  readonly items: readonly InfoItem[];
}

/**
 * CONTENIDO EDITABLE — cambiar solo este array para actualizar la página.
 * `link` se muestra como enlace clickable (nueva pestaña); `valor` es texto plano.
 */
const SECCIONES: readonly InfoSeccion[] = [
  {
    titulo: 'Contactos útiles',
    icono: BookOpen,
    items: [
      { label: 'Contadora', valor: 'Nombre — teléfono / email', nota: 'Facturación y liquidaciones' },
      { label: 'Imprenta / serigrafía externa', valor: 'Nombre — teléfono', nota: 'Trabajos que no hacemos en casa' },
      { label: 'Mensajería / envíos', valor: 'OCA, Andreani, etc.', nota: 'Tarifas y cortes diarios' },
    ],
  },
  {
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
    titulo: 'Procedimientos',
    icono: BookOpen,
    items: [
      { label: 'Cómo se cotiza un pedido B2B', nota: 'Usar Presupuestos B2B → enviar por WhatsApp → si aprueba, crear Pedido.' },
      { label: 'Cómo se sube un diseño al repositorio', nota: 'Repositorio Sublimación → Nuevo Diseño → subir imagen → fijar DPI y licencia PoD.' },
      { label: 'Entrega parcial de un pedido', nota: 'Pedidos → detalle → Registrar Entrega → elegir variantes y cantidades.' },
    ],
  },
  {
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
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/30 shrink-0">
          <BookOpen size={28} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
            Repositorio de Información
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Datos importantes del negocio a mano: contactos, links, procedimientos y referencias.
          </p>
        </div>
      </div>

      {/* SECCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SECCIONES.map((seccion) => {
          const Icon = seccion.icono;
          return (
            <section
              key={seccion.titulo}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              aria-label={seccion.titulo}
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                  {seccion.titulo}
                </h2>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {seccion.items.map((item) => (
                  <li key={item.label} className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.label}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                      >
                        {item.link}
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                    {item.valor && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.valor}</p>
                    )}
                    {item.nota && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{item.nota}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
        Para editar esta información, modificar el array <code className="font-mono">SECCIONES</code> en{' '}
        <code className="font-mono">src/modules/info/pages/InfoResourcesPage.tsx</code>.
      </p>
    </div>
  );
};
